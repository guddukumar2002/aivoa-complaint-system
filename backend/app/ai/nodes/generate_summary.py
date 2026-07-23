from app.ai.state import ComplaintState
from app.ai.prompts import SUMMARY_SYSTEM, SUMMARY_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.summary")

NODE = "generate_summary"


def generate_summary(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        raw = invoke_llm(
            SUMMARY_SYSTEM,
            SUMMARY_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                keywords=", ".join(state.get("extracted_keywords", [])),
                entities=", ".join(state.get("extracted_entities", [])),
            ),
        )
        data = parse_json(raw, NODE)
        return {
            "summary": data.get("summary") or raw,
            "summary_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {"summary": "", "summary_reasoning": "", "errors": [f"{NODE}: {exc}"]}
