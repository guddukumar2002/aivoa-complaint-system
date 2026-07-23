from app.ai.state import ComplaintState
from app.core.logging import get_logger

logger = get_logger("ai.nodes.format_output")

NODE = "format_output"


def format_output(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))

    errors = state.get("errors", [])
    is_valid = state.get("is_valid", True)

    output: dict = {
        "complaint_id": state.get("complaint_id"),
        "pipeline_status": "completed" if not errors else "completed_with_errors",
        "is_valid": is_valid,
        "is_duplicate": state.get("is_duplicate", False),
        "duplicate_of": state.get("duplicate_of"),
        "similarity_score": state.get("similarity_score", 0.0),
        "validation_issues": state.get("validation_issues", []),
        "extraction": {
            "title": state.get("extracted_title") or state.get("title", ""),
            "description": state.get("extracted_description") or state.get("description", ""),
            "keywords": state.get("extracted_keywords", []),
            "entities": state.get("extracted_entities", []),
        },
        "completeness": {
            "score": state.get("completeness_score", 0.5),
            "missing_fields": state.get("completeness_missing", []),
            "reasoning": state.get("completeness_reasoning", ""),
        },
        "summary": state.get("summary", ""),
        "risk": {
            "sentiment": state.get("sentiment", "neutral"),
            "sentiment_score": state.get("sentiment_score", 0.5),
            "risk_level": state.get("risk_level", "medium"),
            "suggested_category": state.get("suggested_category", "other"),
            "suggested_priority": state.get("suggested_priority", "medium"),
        },
        "root_cause_analysis": {
            "root_cause": state.get("root_cause", ""),
            "contributing_factors": state.get("contributing_factors", []),
        },
        "capa": {
            "corrective_actions": state.get("corrective_actions", []),
            "preventive_actions": state.get("preventive_actions", []),
            "timeline_days": state.get("capa_timeline_days"),
        },
        "suggested_response": state.get("suggested_response", ""),
        # ── Per-node AI explanations ───────────────────────────────────
        "explanations": {
            "extraction": state.get("extract_reasoning", ""),
            "validation": state.get("validate_reasoning", ""),
            "completeness": state.get("completeness_reasoning", ""),
            "duplicate_detection": state.get("duplicate_reasoning", ""),
            "summary": state.get("summary_reasoning", ""),
            "risk_classification": state.get("risk_reasoning", ""),
            "root_cause": state.get("root_cause_reasoning", ""),
            "capa": state.get("capa_reasoning", ""),
        },
        "errors": errors,
    }

    # Short-circuit output for invalid complaints
    if not is_valid:
        output["pipeline_status"] = "rejected"
        output["summary"] = ""
        output["root_cause_analysis"] = {}
        output["capa"] = {}
        output["suggested_response"] = ""

    return {"final_output": output}
