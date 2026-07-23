import io
import json
from fastapi import UploadFile
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.logging import get_logger
from app.domain.schemas.copilot import CopilotResponse
from app.ai.prompts_copilot import COPILOT_SYSTEM, COPILOT_HUMAN

logger = get_logger("app.services.copilot")

_ALLOWED_MIME = {"application/pdf", "text/plain"}


def _extract_text_from_pdf(content: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _parse_json(raw: str) -> dict:
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON in LLM response: {raw[:300]}")
    return json.loads(raw[start:end])


def _call_llm(text: str) -> dict:
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.1,
        max_retries=3,
    )
    response = llm.invoke([
        SystemMessage(content=COPILOT_SYSTEM),
        HumanMessage(content=COPILOT_HUMAN.format(text=text[:8000])),
    ])
    return _parse_json(response.content.strip())


class CopilotService:
    async def extract_from_text(self, text: str) -> CopilotResponse:
        if not text or not text.strip():
            raise ValueError("Complaint text is empty")
        logger.info("copilot.extract_from_text len=%d", len(text))
        data = _call_llm(text)
        fields = {k: data.get(k) for k in CopilotResponse.model_fields if k != "confidence_scores"}
        raw_scores = data.get("confidence_scores")
        confidence_scores = (
            {k: float(v) for k, v in raw_scores.items() if isinstance(v, (int, float))}
            if isinstance(raw_scores, dict) else None
        )
        return CopilotResponse(**fields, confidence_scores=confidence_scores)

    async def extract_from_file(self, file: UploadFile) -> CopilotResponse:
        if file.content_type not in _ALLOWED_MIME:
            raise ValueError(f"Unsupported file type: {file.content_type}. Use PDF or plain text.")
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise ValueError("File exceeds 10 MB limit")
        if file.content_type == "application/pdf":
            text = _extract_text_from_pdf(content)
        else:
            text = content.decode("utf-8", errors="replace")
        if not text.strip():
            raise ValueError("Could not extract text from the uploaded file")
        logger.info("copilot.extract_from_file mime=%s len=%d", file.content_type, len(text))
        data = _call_llm(text)
        fields = {k: data.get(k) for k in CopilotResponse.model_fields if k != "confidence_scores"}
        raw_scores = data.get("confidence_scores")
        confidence_scores = (
            {k: float(v) for k, v in raw_scores.items() if isinstance(v, (int, float))}
            if isinstance(raw_scores, dict) else None
        )
        return CopilotResponse(**fields, confidence_scores=confidence_scores)
