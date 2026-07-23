from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: str
    complaint_id: str
    file_name: str
    file_size: int
    mime_type: str
    file_path: str
    uploaded_by: str
