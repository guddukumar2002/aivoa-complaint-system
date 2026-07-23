import uuid
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.domain.models.mixins import TimestampMixin


class ComplaintTimeline(TimestampMixin, Base):
    __tablename__ = "complaint_timeline"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id: Mapped[str] = mapped_column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    previous_value: Mapped[str | None] = mapped_column(String(100), nullable=True)
    new_value: Mapped[str | None] = mapped_column(String(100), nullable=True)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="timeline")
    actor: Mapped["User"] = relationship("User")

    __table_args__ = (Index("ix_complaint_timeline_complaint_id", "complaint_id"),)
