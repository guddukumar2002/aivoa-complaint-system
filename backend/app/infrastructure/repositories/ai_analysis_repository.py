from sqlalchemy.orm import Session
from app.domain.models.ai_analysis import AIAnalysis
from app.infrastructure.repositories.base import BaseRepository


class AIAnalysisRepository(BaseRepository[AIAnalysis]):
    def __init__(self, db: Session):
        super().__init__(AIAnalysis, db)

    def get_by_complaint(self, complaint_id: str) -> AIAnalysis | None:
        return self.db.query(AIAnalysis).filter(AIAnalysis.complaint_id == complaint_id).first()
