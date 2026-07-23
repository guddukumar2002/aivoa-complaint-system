from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.domain.models.user import User
from app.domain.schemas.upload import UploadResponse
from app.domain.schemas.complaint_document import DocumentResponse
from app.application.services.upload_service import UploadService
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/complaints/{complaint_id}/documents", tags=["documents"])


def _svc(db: Session = Depends(get_db)) -> UploadService:
    return UploadService(db)


@router.post("", response_model=UploadResponse, status_code=201)
async def upload_document(
    complaint_id: str,
    file: UploadFile = File(...),
    svc: UploadService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return await svc.upload(complaint_id, file, current_user)


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    complaint_id: str,
    svc: UploadService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.list_documents(complaint_id, current_user)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    complaint_id: str,
    document_id: str,
    svc: UploadService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    svc.delete_document(complaint_id, document_id, current_user)


@router.get("/{document_id}/download", response_class=FileResponse)
def download_document(
    complaint_id: str,
    document_id: str,
    svc: UploadService = Depends(_svc),
    current_user: User = Depends(get_current_user),
):
    return svc.download_document(complaint_id, document_id, current_user)
