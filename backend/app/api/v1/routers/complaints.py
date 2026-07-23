from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.domain.models.complaint import ComplaintStatus, ComplaintPriority, ComplaintCategory
from app.domain.models.user import User
from app.domain.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintListResponse
from app.application.services.complaint_service import ComplaintService
from app.api.v1.deps import get_current_user
from typing import Optional

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _svc(db: Session = Depends(get_db)) -> ComplaintService:
    return ComplaintService(db)


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    payload: ComplaintCreate,
    svc: ComplaintService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.create(payload, current_user)


@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    status: Optional[ComplaintStatus] = Query(default=None),
    priority: Optional[ComplaintPriority] = Query(default=None),
    category: Optional[ComplaintCategory] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    svc: ComplaintService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.list(current_user, status, priority, category, page, page_size)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    svc: ComplaintService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.get(complaint_id, current_user)


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdate,
    svc: ComplaintService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.update(complaint_id, payload, current_user)


@router.delete("/{complaint_id}", status_code=204)
def delete_complaint(
    complaint_id: str,
    svc: ComplaintService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    svc.delete(complaint_id, current_user)
