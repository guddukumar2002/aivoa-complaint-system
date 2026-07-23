from app.ai.state import ComplaintState
from app.ai.prompts import DUPLICATE_SYSTEM, DUPLICATE_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.duplicate")

NODE = "duplicate_detect"
_DUPLICATE_THRESHOLD = 0.85


def duplicate_detect(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))

    existing = state.get("existing_complaints", [])
    if not existing:
        return {
            "is_duplicate": False,
            "duplicate_of": None,
            "similarity_score": 0.0,
            "duplicate_reasoning": "No existing complaints provided for comparison.",
            "errors": [],
        }

    try:
        existing_list = "\n".join(f"- {t}" for t in existing)
        raw = invoke_llm(
            DUPLICATE_SYSTEM,
            DUPLICATE_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                existing_list=existing_list,
            ),
        )
        data = parse_json(raw, NODE)
        score = float(data.get("similarity_score", 0.0))
        is_dup = data.get("is_duplicate", False) or score >= _DUPLICATE_THRESHOLD

        logger.info("node=%s is_duplicate=%s score=%.2f", NODE, is_dup, score)
        return {
            "is_duplicate": is_dup,
            "duplicate_of": data.get("duplicate_of"),
            "similarity_score": score,
            "duplicate_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "is_duplicate": False,
            "duplicate_of": None,
            "similarity_score": 0.0,
            "duplicate_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
