from app.ai.state import ComplaintState
from app.ai.prompts import VALIDATE_SYSTEM, VALIDATE_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.validate")

NODE = "validate"

_MIN_TITLE_LEN = 5
_MIN_DESC_LEN = 20


def validate_complaint(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))

    title = state.get("extracted_title") or state.get("title", "")
    description = state.get("extracted_description") or state.get("description", "")

    # Rule-based pre-check (fast, no LLM cost)
    issues: list[str] = []
    if len(title.strip()) < _MIN_TITLE_LEN:
        issues.append("Title is too short or missing")
    if len(description.strip()) < _MIN_DESC_LEN:
        issues.append("Description is too short to be actionable")

    if issues:
        return {
            "is_valid": False,
            "validation_issues": issues,
            "validate_reasoning": "Failed rule-based length checks before LLM validation.",
            "errors": [],
        }

    # LLM-based semantic validation
    try:
        raw = invoke_llm(
            VALIDATE_SYSTEM,
            VALIDATE_HUMAN.format(
                title=title,
                description=description,
                keywords=", ".join(state.get("extracted_keywords", [])),
                entities=", ".join(state.get("extracted_entities", [])),
            ),
        )
        data = parse_json(raw, NODE)
        return {
            "is_valid": data.get("is_valid", True),
            "validation_issues": data.get("validation_issues", []),
            "validate_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "is_valid": True,
            "validation_issues": [],
            "validate_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
