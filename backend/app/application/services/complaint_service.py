from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ForbiddenError
from app.core.logging import get_logger
from app.domain.models.complaint import Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory
from app.domain.models.user import User, UserRole
from app.domain.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintListResponse
from app.infrastructure.repositories.complaint_repository import ComplaintRepository
from app.infrastructure.repositories.complaint_timeline_repository import ComplaintTimelineRepository

logger = get_logger(__name__)


class ComplaintService:
    def __init__(self, db: Session):
        self.repo = ComplaintRepository(db)
        self.timeline = ComplaintTimelineRepository(db)

    def create(self, payload: ComplaintCreate, current_user: User) -> ComplaintResponse:
        complaint = Complaint(
            user_id=current_user.id,
            title=payload.title,
            description=payload.description,
            category=payload.category,
        )
        saved = self.repo.save(complaint)
        self.timeline.record(
            complaint_id=saved.id,
            actor_id=current_user.id,
            event_type="created",
            description=f"Complaint created by {current_user.full_name}",
        )
        logger.info("complaint.created id=%s user=%s", saved.id, current_user.id)
        return ComplaintResponse.model_validate(saved)

    def list(
        self,
        current_user: User,
        status: ComplaintStatus | None,
        priority: ComplaintPriority | None,
        category: ComplaintCategory | None,
        page: int,
        page_size: int,
    ) -> ComplaintListResponse:
        skip = (page - 1) * page_size
        if current_user.role == UserRole.customer:
            items = self.repo.list_by_user(current_user.id, skip=skip, limit=page_size)
            total = self.repo.count_by_user(current_user.id)
        else:
            items, total = self.repo.list_filtered(
                status=status,
                priority=priority,
                assigned_agent_id=current_user.id if current_user.role == UserRole.agent else None,
                skip=skip,
                limit=page_size,
            )
        return ComplaintListResponse(
            items=[ComplaintResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get(self, complaint_id: str, current_user: User) -> ComplaintResponse:
        complaint = self._get_owned(complaint_id, current_user)
        return ComplaintResponse.model_validate(complaint)

    def update(self, complaint_id: str, payload: ComplaintUpdate, current_user: User) -> ComplaintResponse:
        complaint = self._get_owned(complaint_id, current_user)
        changes: list[tuple[str, str, str]] = []

        for field, value in payload.model_dump(exclude_none=True).items():
            old = str(getattr(complaint, field))
            setattr(complaint, field, value)
            changes.append((field, old, str(value)))

        saved = self.repo.save(complaint)

        for field, old, new in changes:
            self.timeline.record(
                complaint_id=saved.id,
                actor_id=current_user.id,
                event_type=f"updated.{field}",
                description=f"{field} changed by {current_user.full_name}",
                previous_value=old,
                new_value=new,
            )

        logger.info("complaint.updated id=%s fields=%s", saved.id, [c[0] for c in changes])
        return ComplaintResponse.model_validate(saved)

    def delete(self, complaint_id: str, current_user: User) -> None:
        complaint = self._get_owned(complaint_id, current_user)
        self.repo.delete(complaint)
        logger.info("complaint.deleted id=%s by=%s", complaint_id, current_user.id)

    def _get_owned(self, complaint_id: str, current_user: User) -> Complaint:
        complaint = self.repo.get(complaint_id)
        if not complaint:
            raise NotFoundError("Complaint", complaint_id)
        is_owner = complaint.user_id == current_user.id
        is_staff = current_user.role in (UserRole.admin, UserRole.agent)
        if not is_owner and not is_staff:
            raise ForbiddenError()
        return complaint
