from sqlalchemy.orm import Session
from app.ai.graph import complaint_graph
from app.ai.state import ComplaintState
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.domain.models.ai_analysis import AIAnalysis
from app.infrastructure.repositories.complaint_repository import ComplaintRepository
from app.infrastructure.repositories.ai_analysis_repository import AIAnalysisRepository

logger = get_logger("app.services.langgraph")


class LangGraphService:
    def __init__(self, db: Session):
        self.complaint_repo = ComplaintRepository(db)
        self.analysis_repo = AIAnalysisRepository(db)

    def run(
        self,
        complaint_id: str,
        title: str,
        description: str,
        category: str = "other",
        existing_complaints: list[str] | None = None,
    ) -> dict:
        complaint = self.complaint_repo.get(complaint_id)
        if not complaint:
            raise NotFoundError("Complaint", complaint_id)

        initial_state: ComplaintState = {
            "complaint_id": complaint_id,
            "title": title,
            "description": description,
            "category": category,
            "existing_complaints": existing_complaints or [],
            "errors": [],
            "validation_issues": [],
        }

        logger.info("langgraph.run start complaint_id=%s", complaint_id)
        final_state: ComplaintState = complaint_graph.invoke(initial_state)
        logger.info(
            "langgraph.run done complaint_id=%s status=%s errors=%d",
            complaint_id,
            final_state.get("final_output", {}).get("pipeline_status"),
            len(final_state.get("errors", [])),
        )

        output = final_state.get("final_output", {})
        self._persist(complaint_id, final_state, output)
        return output

    # ── Persistence ────────────────────────────────────────────────────

    def _persist(self, complaint_id: str, state: ComplaintState, output: dict) -> None:
        """Upsert AIAnalysis row with the full pipeline result."""
        risk = output.get("risk", {})
        rca = output.get("root_cause_analysis", {})

        existing = self.analysis_repo.get_by_complaint(complaint_id)
        if existing:
            self._apply_fields(existing, state, risk, rca, output)
            self.analysis_repo.save(existing)
        else:
            record = AIAnalysis(complaint_id=complaint_id)
            self._apply_fields(record, state, risk, rca, output)
            self.analysis_repo.save(record)

        logger.info("langgraph.persist complaint_id=%s", complaint_id)

    @staticmethod
    def _apply_fields(
        record: AIAnalysis,
        state: ComplaintState,
        risk: dict,
        rca: dict,
        output: dict,
    ) -> None:
        record.sentiment = risk.get("sentiment")
        record.sentiment_score = risk.get("sentiment_score")
        record.suggested_category = risk.get("suggested_category")
        record.suggested_priority = risk.get("suggested_priority")
        record.summary = output.get("summary")
        record.suggested_response = output.get("suggested_response")
        record.raw_output = output
