import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("ai.nodes")


def get_llm() -> ChatGroq:
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.2,
        max_retries=2,
    )


def invoke_llm(system: str, human: str) -> str:
    llm = get_llm()
    response = llm.invoke([SystemMessage(content=system), HumanMessage(content=human)])
    return response.content.strip()


def parse_json(raw: str, node_name: str) -> dict:
    """
    Robustly extract a JSON object from LLM output.
    Handles markdown fences, leading text, and trailing text.
    Returns empty dict on failure so the graph can continue.
    """
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON braces found")
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("node=%s json_parse_failed error=%s raw=%s", node_name, exc, raw[:300])
        return {}
