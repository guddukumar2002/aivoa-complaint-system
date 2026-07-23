import os
import uuid
from fastapi import UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ForbiddenError, UploadError
from app.core.logging import get_logger
from app.domain.models.complaint_document import ComplaintDocument
from app.domain.models.user import User, UserRole
from app.domain.schemas.upload import UploadResponse
from app.domain.schemas.complaint_document import DocumentResponse
from app.infrastructure.repositories.complaint_repository import ComplaintRepository
from app.infrastructure.repositories.complaint_document_repository import ComplaintDocumentRepository

logger = get_logger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "text/plain",
    "message/rfc822",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")


class UploadService:
    def __init__(self, db: Session):
        self.complaint_repo = ComplaintRepository(db)
        self.doc_repo = ComplaintDocumentRepository(db)

    def _assert_access(self, complaint_id: str, current_user: User) -> None:
        complaint = self.complaint_repo.get(complaint_id)
        if not complaint:
            raise NotFoundError("Complaint", complaint_id)
        is_owner = complaint.user_id == current_user.id
        is_staff = current_user.role in (UserRole.admin, UserRole.agent)
        if not is_owner and not is_staff:
            raise ForbiddenError()

    async def upload(self, complaint_id: str, file: UploadFile, current_user: User) -> UploadResponse:
        self._assert_access(complaint_id, current_user)

        if file.content_type not in ALLOWED_MIME_TYPES:
            raise UploadError(f"File type '{file.content_type}' is not allowed")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise UploadError(f"File exceeds maximum size of {MAX_FILE_SIZE // (1024 * 1024)} MB")
        if len(content) == 0:
            raise UploadError("File is empty")

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename or "")[1]
        stored_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, stored_name)

        with open(file_path, "wb") as f:
            f.write(content)

        doc = ComplaintDocument(
            complaint_id=complaint_id,
            file_name=file.filename or stored_name,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type,
            uploaded_by=current_user.id,
        )
        saved = self.doc_repo.save(doc)
        logger.info("upload.saved doc=%s complaint=%s size=%d", saved.id, complaint_id, len(content))

        return UploadResponse(
            id=saved.id,
            complaint_id=saved.complaint_id,
            file_name=saved.file_name,
            file_size=saved.file_size,
            mime_type=saved.mime_type,
            file_path=saved.file_path,
            uploaded_by=saved.uploaded_by,
        )

    def list_documents(self, complaint_id: str, current_user: User) -> list[DocumentResponse]:
        self._assert_access(complaint_id, current_user)
        docs = self.doc_repo.list_by_complaint(complaint_id)
        return [DocumentResponse.model_validate(d) for d in docs]

    def delete_document(self, complaint_id: str, document_id: str, current_user: User) -> None:
        self._assert_access(complaint_id, current_user)
        doc = self.doc_repo.get(document_id)
        if not doc or doc.complaint_id != complaint_id:
            raise NotFoundError("Document", document_id)
        # Only staff or the uploader can delete
        if doc.uploaded_by != current_user.id and current_user.role not in (UserRole.admin, UserRole.agent):
            raise ForbiddenError()
        # Remove physical file
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        self.doc_repo.delete(doc)
        logger.info("upload.deleted doc=%s complaint=%s by=%s", document_id, complaint_id, current_user.id)

    def download_document(self, complaint_id: str, document_id: str, current_user: User) -> FileResponse:
        self._assert_access(complaint_id, current_user)
        doc = self.doc_repo.get(document_id)
        if not doc or doc.complaint_id != complaint_id:
            raise NotFoundError("Document", document_id)
        if not os.path.exists(doc.file_path):
            raise NotFoundError("File", document_id)
        return FileResponse(
            path=doc.file_path,
            filename=doc.file_name,
            media_type=doc.mime_type,
        )
