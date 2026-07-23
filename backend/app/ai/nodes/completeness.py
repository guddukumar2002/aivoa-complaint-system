from app.ai.state import ComplaintState
from app.ai.prompts import COMPLETENESS_SYSTEM, COMPLETENESS_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.completeness")

NODE = "completeness"


def check_completeness(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        raw = invoke_llm(
            COMPLETENESS_SYSTEM,
            COMPLETENESS_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                keywords=", ".join(state.get("extracted_keywords", [])),
                entities=", ".join(state.get("extracted_entities", [])),
                category=state.get("category", "other"),
            ),
        )
        data = parse_json(raw, NODE)
        score = float(data.get("completeness_score", 0.5))
        score = max(0.0, min(1.0, score))  # clamp to [0, 1]
        return {
            "completeness_score": score,
            "completeness_missing": data.get("missing_fields", []),
            "completeness_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "completeness_score": 0.5,
            "completeness_missing": [],
            "completeness_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
