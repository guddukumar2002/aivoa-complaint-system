"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("admin", "agent", "customer", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_email_active", "users", ["email", "is_active"])

    op.create_table(
        "complaints",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("open", "in_progress", "resolved", "closed", name="complaintstatus"), nullable=False),
        sa.Column("priority", sa.Enum("low", "medium", "high", "critical", name="complaintpriority"), nullable=False),
        sa.Column("category", sa.Enum("billing", "technical", "service", "product", "other", name="complaintcategory"), nullable=False),
        sa.Column("assigned_agent_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_complaints_user_id", "complaints", ["user_id"])
    op.create_index("ix_complaints_status", "complaints", ["status"])
    op.create_index("ix_complaints_status_priority", "complaints", ["status", "priority"])
    op.create_index("ix_complaints_assigned_agent", "complaints", ["assigned_agent_id"])

    op.create_table(
        "complaint_documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("complaint_id", sa.String(36), sa.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_name", sa.String(500), nullable=False),
        sa.Column("file_path", sa.String(1000), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_complaint_documents_complaint_id", "complaint_documents", ["complaint_id"])

    op.create_table(
        "complaint_timeline",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("complaint_id", sa.String(36), sa.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("previous_value", sa.String(100), nullable=True),
        sa.Column("new_value", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_complaint_timeline_complaint_id", "complaint_timeline", ["complaint_id"])

    op.create_table(
        "ai_analysis",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("complaint_id", sa.String(36), sa.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sentiment", sa.String(50), nullable=True),
        sa.Column("sentiment_score", sa.Float(), nullable=True),
        sa.Column("suggested_category", sa.String(100), nullable=True),
        sa.Column("suggested_priority", sa.String(50), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("suggested_response", sa.Text(), nullable=True),
        sa.Column("raw_output", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("complaint_id", name="uq_ai_analysis_complaint_id"),
    )
    op.create_index("ix_ai_analysis_complaint_id", "ai_analysis", ["complaint_id"])


def downgrade() -> None:
    op.drop_table("ai_analysis")
    op.drop_table("complaint_timeline")
    op.drop_table("complaint_documents")
    op.drop_table("complaints")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS complaintstatus")
    op.execute("DROP TYPE IF EXISTS complaintpriority")
    op.execute("DROP TYPE IF EXISTS complaintcategory")
