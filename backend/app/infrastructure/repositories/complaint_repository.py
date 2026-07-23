from sqlalchemy.orm import Session
from app.domain.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.infrastructure.repositories.base import BaseRepository


class ComplaintRepository(BaseRepository[Complaint]):
    def __init__(self, db: Session):
        super().__init__(Complaint, db)

    def list_by_user(self, user_id: str, skip: int = 0, limit: int = 20) -> list[Complaint]:
        return (
            self.db.query(Complaint)
            .filter(Complaint.user_id == user_id)
            .order_by(Complaint.created_at.desc())
            .offset(skip).limit(limit).all()
        )

    def count_by_user(self, user_id: str) -> int:
        return self.db.query(Complaint).filter(Complaint.user_id == user_id).count()

    def list_filtered(
        self,
        status: ComplaintStatus | None = None,
        priority: ComplaintPriority | None = None,
        assigned_agent_id: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Complaint], int]:
        q = self.db.query(Complaint)
        if status:
            q = q.filter(Complaint.status == status)
        if priority:
            q = q.filter(Complaint.priority == priority)
        if assigned_agent_id:
            q = q.filter(Complaint.assigned_agent_id == assigned_agent_id)
        total = q.count()
        items = q.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
        return items, total
