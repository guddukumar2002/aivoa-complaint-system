import json
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.domain.models.ai_analysis import AIAnalysis
from app.domain.schemas.ai_request import (
    AIAnalyzeRequest, AIAnalyzeResponse,
    AISummaryRequest, AISummaryResponse,
    AIRootCauseRequest, AIRootCauseResponse,
    AICapaRequest, AICapaResponse,
)
from app.domain.schemas.pipeline import CompletenessRequest, CompletenessResponse
from app.ai.nodes import invoke_llm, parse_json
from app.ai.prompts import COMPLETENESS_SYSTEM, COMPLETENESS_HUMAN
from app.infrastructure.repositories.complaint_repository import ComplaintRepository
from app.infrastructure.repositories.ai_analysis_repository import AIAnalysisRepository

logger = get_logger(__name__)


def _llm() -> ChatGroq:
    return ChatGroq(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL, temperature=0.2)


def _invoke(system: str, human: str) -> str:
    response = _llm().invoke([SystemMessage(content=system), HumanMessage(content=human)])
    return response.content.strip()


def _parse_json(raw: str) -> dict:
    """Extract JSON block from LLM response, tolerating markdown fences."""
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in LLM response: {raw[:200]}")
    return json.loads(raw[start:end])


class AIService:
    def __init__(self, db: Session):
        self.complaint_repo = ComplaintRepository(db)
        self.analysis_repo = AIAnalysisRepository(db)

    # ------------------------------------------------------------------ #
    # 1. Full Analysis                                                     #
    # ------------------------------------------------------------------ #
    def analyze(self, req: AIAnalyzeRequest) -> AIAnalyzeResponse:
        self._assert_complaint_exists(req.complaint_id)

        system = (
            "You are an expert customer complaint analyst. "
            "Respond ONLY with a valid JSON object — no markdown, no explanation. "
            "Keys: sentiment (positive|neutral|negative), sentiment_score (0.0-1.0), "
            "suggested_category (billing|technical|service|product|other), "
            "suggested_priority (low|medium|high|critical), "
            "summary (1-2 sentences), suggested_response (professional reply draft)."
        )
        human = f"Title: {req.title}\n\nDescription: {req.description}"
        raw = _invoke(system, human)
        logger.info("ai.analyze complaint=%s raw_len=%d", req.complaint_id, len(raw))

        data = _parse_json(raw)
        self._upsert_analysis(req.complaint_id, data, raw)

        return AIAnalyzeResponse(
            complaint_id=req.complaint_id,
            sentiment=data.get("sentiment", "neutral"),
            sentiment_score=float(data.get("sentiment_score", 0.5)),
            suggested_category=data.get("suggested_category", "other"),
            suggested_priority=data.get("suggested_priority", "medium"),
            summary=data.get("summary", ""),
            suggested_response=data.get("suggested_response", ""),
        )

    # ------------------------------------------------------------------ #
    # 2. Summary                                                           #
    # ------------------------------------------------------------------ #
    def summary(self, req: AISummaryRequest) -> AISummaryResponse:
        self._assert_complaint_exists(req.complaint_id)

        timeline_text = "\n".join(f"- {e}" for e in req.timeline) if req.timeline else "No timeline events."
        system = (
            "You are a complaint management assistant. "
            "Respond ONLY with a valid JSON object. Key: summary (concise 3-5 sentence executive summary)."
        )
        human = f"Title: {req.title}\nDescription: {req.description}\nTimeline:\n{timeline_text}"
        raw = _invoke(system, human)
        logger.info("ai.summary complaint=%s", req.complaint_id)

        data = _parse_json(raw)
        return AISummaryResponse(complaint_id=req.complaint_id, summary=data.get("summary", raw))

    # ------------------------------------------------------------------ #
    # 3. Root Cause Analysis                                               #
    # ------------------------------------------------------------------ #
    def root_cause(self, req: AIRootCauseRequest) -> AIRootCauseResponse:
        self._assert_complaint_exists(req.complaint_id)

        system = (
            "You are a root cause analysis expert. "
            "Respond ONLY with a valid JSON object. "
            "Keys: root_cause (string), contributing_factors (array of strings, max 5)."
        )
        human = f"Category: {req.category}\nTitle: {req.title}\nDescription: {req.description}"
        raw = _invoke(system, human)
        logger.info("ai.root_cause complaint=%s", req.complaint_id)

        data = _parse_json(raw)
        return AIRootCauseResponse(
            complaint_id=req.complaint_id,
            root_cause=data.get("root_cause", ""),
            contributing_factors=data.get("contributing_factors", []),
        )

    # ------------------------------------------------------------------ #
    # 4. CAPA (Corrective and Preventive Actions)                         #
    # ------------------------------------------------------------------ #
    def capa(self, req: AICapaRequest) -> AICapaResponse:
        self._assert_complaint_exists(req.complaint_id)

        system = (
            "You are a quality management expert specializing in CAPA. "
            "Respond ONLY with a valid JSON object. "
            "Keys: corrective_actions (array of strings), "
            "preventive_actions (array of strings), timeline_days (integer estimate)."
        )
        human = f"Title: {req.title}\nDescription: {req.description}\nRoot Cause: {req.root_cause}"
        raw = _invoke(system, human)
        logger.info("ai.capa complaint=%s", req.complaint_id)

        data = _parse_json(raw)
        return AICapaResponse(
            complaint_id=req.complaint_id,
            corrective_actions=data.get("corrective_actions", []),
            preventive_actions=data.get("preventive_actions", []),
            timeline_days=data.get("timeline_days"),
        )

    # ------------------------------------------------------------------ #
    # 5. Completeness Check                                                #
    # ------------------------------------------------------------------ #
    def completeness(self, req: CompletenessRequest) -> CompletenessResponse:
        self._assert_complaint_exists(req.complaint_id)
        raw = invoke_llm(
            COMPLETENESS_SYSTEM,
            COMPLETENESS_HUMAN.format(
                title=req.title,
                description=req.description,
                keywords="",
                entities="",
                category=req.category,
            ),
        )
        data = parse_json(raw, "completeness")
        score = float(data.get("completeness_score", 0.5))
        return CompletenessResponse(
            complaint_id=req.complaint_id,
            score=max(0.0, min(1.0, score)),
            missing_fields=data.get("missing_fields", []),
            reasoning=data.get("reasoning", ""),
        )

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #
    def _assert_complaint_exists(self, complaint_id: str) -> None:
        if not self.complaint_repo.get(complaint_id):
            raise NotFoundError("Complaint", complaint_id)

    def _upsert_analysis(self, complaint_id: str, data: dict, raw: str) -> None:
        existing = self.analysis_repo.get_by_complaint(complaint_id)
        if existing:
            existing.sentiment = data.get("sentiment")
            existing.sentiment_score = data.get("sentiment_score")
            existing.suggested_category = data.get("suggested_category")
            existing.suggested_priority = data.get("suggested_priority")
            existing.summary = data.get("summary")
            existing.suggested_response = data.get("suggested_response")
            existing.raw_output = data
            self.analysis_repo.save(existing)
        else:
            analysis = AIAnalysis(
                complaint_id=complaint_id,
                sentiment=data.get("sentiment"),
                sentiment_score=data.get("sentiment_score"),
                suggested_category=data.get("suggested_category"),
                suggested_priority=data.get("suggested_priority"),
                summary=data.get("summary"),
                suggested_response=data.get("suggested_response"),
                raw_output=data,
            )
            self.analysis_repo.save(analysis)
