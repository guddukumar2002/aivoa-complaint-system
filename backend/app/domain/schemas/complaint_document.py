from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class TimelineEventResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    complaint_id: str
    actor_id: str
    event_type: str
    description: str
    previous_value: Optional[str]
    new_value: Optional[str]
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    complaint_id: str
    file_name: str
    file_size: int
    mime_type: str
    file_path: str
    uploaded_by: str
    created_at: datetime
