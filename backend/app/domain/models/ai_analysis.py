import uuid
from sqlalchemy import String, Text, Float, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.domain.models.mixins import TimestampMixin


class AIAnalysis(TimestampMixin, Base):
    __tablename__ = "ai_analysis"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id: Mapped[str] = mapped_column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, unique=True)
    sentiment: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    suggested_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    suggested_priority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    suggested_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_output: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="ai_analysis")

    __table_args__ = (Index("ix_ai_analysis_complaint_id", "complaint_id"),)
