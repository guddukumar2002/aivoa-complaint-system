from app.ai.state import ComplaintState
from app.ai.prompts import EXTRACT_SYSTEM, EXTRACT_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.extract")

NODE = "extract"


def extract_complaint(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        raw = invoke_llm(
            EXTRACT_SYSTEM,
            EXTRACT_HUMAN.format(
                title=state.get("title", ""),
                description=state.get("description", ""),
            ),
        )
        data = parse_json(raw, NODE)
        return {
            "extracted_title": data.get("extracted_title") or state.get("title", ""),
            "extracted_description": data.get("extracted_description") or state.get("description", ""),
            "extracted_keywords": data.get("extracted_keywords", []),
            "extracted_entities": data.get("extracted_entities", []),
            "extract_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "extracted_title": state.get("title", ""),
            "extracted_description": state.get("description", ""),
            "extracted_keywords": [],
            "extracted_entities": [],
            "extract_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
