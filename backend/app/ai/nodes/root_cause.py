from app.ai.state import ComplaintState
from app.ai.prompts import ROOT_CAUSE_SYSTEM, ROOT_CAUSE_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.root_cause")

NODE = "root_cause"


def root_cause(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        raw = invoke_llm(
            ROOT_CAUSE_SYSTEM,
            ROOT_CAUSE_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                category=state.get("suggested_category") or state.get("category", "other"),
                risk_level=state.get("risk_level", "medium"),
                summary=state.get("summary", ""),
            ),
        )
        data = parse_json(raw, NODE)
        return {
            "root_cause": data.get("root_cause", ""),
            "contributing_factors": data.get("contributing_factors", []),
            "root_cause_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "root_cause": "",
            "contributing_factors": [],
            "root_cause_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
