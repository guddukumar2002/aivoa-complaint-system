from app.ai.state import ComplaintState
from app.ai.prompts import CAPA_SYSTEM, CAPA_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.capa")

NODE = "capa"


def capa(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        factors = state.get("contributing_factors", [])
        raw = invoke_llm(
            CAPA_SYSTEM,
            CAPA_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                root_cause=state.get("root_cause", ""),
                contributing_factors=", ".join(factors) if factors else "None identified",
                priority=state.get("suggested_priority", "medium"),
            ),
        )
        data = parse_json(raw, NODE)
        timeline = data.get("timeline_days")
        return {
            "corrective_actions": data.get("corrective_actions", []),
            "preventive_actions": data.get("preventive_actions", []),
            "capa_timeline_days": int(timeline) if timeline is not None else None,
            "suggested_response": data.get("suggested_response", ""),
            "capa_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "corrective_actions": [],
            "preventive_actions": [],
            "capa_timeline_days": None,
            "suggested_response": "",
            "capa_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
