from sqlalchemy.orm import Session
from app.domain.models.complaint_timeline import ComplaintTimeline
from app.infrastructure.repositories.base import BaseRepository


class ComplaintTimelineRepository(BaseRepository[ComplaintTimeline]):
    def __init__(self, db: Session):
        super().__init__(ComplaintTimeline, db)

    def list_by_complaint(self, complaint_id: str) -> list[ComplaintTimeline]:
        return (
            self.db.query(ComplaintTimeline)
            .filter(ComplaintTimeline.complaint_id == complaint_id)
            .order_by(ComplaintTimeline.created_at.asc())
            .all()
        )

    def record(
        self,
        complaint_id: str,
        actor_id: str,
        event_type: str,
        description: str,
        previous_value: str | None = None,
        new_value: str | None = None,
    ) -> ComplaintTimeline:
        event = ComplaintTimeline(
            complaint_id=complaint_id,
            actor_id=actor_id,
            event_type=event_type,
            description=description,
            previous_value=previous_value,
            new_value=new_value,
        )
        return self.save(event)
