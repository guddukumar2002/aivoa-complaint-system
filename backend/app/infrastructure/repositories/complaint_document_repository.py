from sqlalchemy.orm import Session
from app.domain.models.complaint_document import ComplaintDocument
from app.infrastructure.repositories.base import BaseRepository


class ComplaintDocumentRepository(BaseRepository[ComplaintDocument]):
    def __init__(self, db: Session):
        super().__init__(ComplaintDocument, db)

    def list_by_complaint(self, complaint_id: str) -> list[ComplaintDocument]:
        return (
            self.db.query(ComplaintDocument)
            .filter(ComplaintDocument.complaint_id == complaint_id)
            .order_by(ComplaintDocument.created_at.desc())
            .all()
        )
