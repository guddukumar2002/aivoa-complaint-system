from app.ai.state import ComplaintState
from app.ai.prompts import RISK_SYSTEM, RISK_HUMAN
from app.ai.nodes import invoke_llm, parse_json
from app.core.logging import get_logger

logger = get_logger("ai.nodes.risk")

NODE = "risk_classify"

_VALID_SENTIMENTS = {"positive", "neutral", "negative"}
_VALID_LEVELS = {"low", "medium", "high", "critical"}
_VALID_CATEGORIES = {"product_quality", "packaging", "labeling", "adverse_event", "delivery", "other"}


def risk_classify(state: ComplaintState) -> dict:
    logger.info("node=%s complaint_id=%s", NODE, state.get("complaint_id"))
    try:
        raw = invoke_llm(
            RISK_SYSTEM,
            RISK_HUMAN.format(
                title=state.get("extracted_title") or state.get("title", ""),
                description=state.get("extracted_description") or state.get("description", ""),
                summary=state.get("summary", ""),
                category=state.get("category", "other"),
            ),
        )
        data = parse_json(raw, NODE)

        sentiment = data.get("sentiment", "neutral")
        if sentiment not in _VALID_SENTIMENTS:
            sentiment = "neutral"

        risk_level = data.get("risk_level", "medium")
        if risk_level not in _VALID_LEVELS:
            risk_level = "medium"

        suggested_category = data.get("suggested_category", "other")
        if suggested_category not in _VALID_CATEGORIES:
            suggested_category = state.get("category", "other")

        suggested_priority = data.get("suggested_priority", "medium")
        if suggested_priority not in _VALID_LEVELS:
            suggested_priority = "medium"

        return {
            "sentiment": sentiment,
            "sentiment_score": float(data.get("sentiment_score", 0.5)),
            "risk_level": risk_level,
            "suggested_category": suggested_category,
            "suggested_priority": suggested_priority,
            "risk_reasoning": data.get("reasoning", ""),
            "errors": [],
        }
    except Exception as exc:
        logger.error("node=%s error=%s", NODE, exc)
        return {
            "sentiment": "neutral",
            "sentiment_score": 0.5,
            "risk_level": "medium",
            "suggested_category": state.get("category", "other"),
            "suggested_priority": "medium",
            "risk_reasoning": "",
            "errors": [f"{NODE}: {exc}"],
        }
