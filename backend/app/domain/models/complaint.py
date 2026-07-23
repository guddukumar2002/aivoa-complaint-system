import enum
import uuid
from sqlalchemy import String, Text, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.domain.models.mixins import TimestampMixin


class ComplaintStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class ComplaintPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ComplaintCategory(str, enum.Enum):
    product_quality = "product_quality"
    packaging = "packaging"
    labeling = "labeling"
    adverse_event = "adverse_event"
    delivery = "delivery"
    other = "other"


class Complaint(TimestampMixin, Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus), default=ComplaintStatus.open, nullable=False)
    priority: Mapped[ComplaintPriority] = mapped_column(Enum(ComplaintPriority), default=ComplaintPriority.medium, nullable=False)
    category: Mapped[ComplaintCategory] = mapped_column(Enum(ComplaintCategory), default=ComplaintCategory.other, nullable=False)
    assigned_agent_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="complaints")
    assigned_agent: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_agent_id])
    documents: Mapped[list["ComplaintDocument"]] = relationship("ComplaintDocument", back_populates="complaint", cascade="all, delete-orphan")
    timeline: Mapped[list["ComplaintTimeline"]] = relationship("ComplaintTimeline", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintTimeline.created_at")
    ai_analysis: Mapped["AIAnalysis | None"] = relationship("AIAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_complaints_user_id", "user_id"),
        Index("ix_complaints_status", "status"),
        Index("ix_complaints_status_priority", "status", "priority"),
        Index("ix_complaints_assigned_agent", "assigned_agent_id"),
    )
