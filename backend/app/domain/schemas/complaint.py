from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.domain.models.complaint import ComplaintStatus, ComplaintPriority, ComplaintCategory


class ComplaintCreate(BaseModel):
    title: str = Field(min_length=5, max_length=500)
    description: str = Field(min_length=10)
    category: ComplaintCategory = ComplaintCategory.other


class ComplaintUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=5, max_length=500)
    description: Optional[str] = None
    status: Optional[ComplaintStatus] = None
    priority: Optional[ComplaintPriority] = None
    category: Optional[ComplaintCategory] = None
    assigned_agent_id: Optional[str] = None
    resolution_notes: Optional[str] = None


class ComplaintResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    user_id: str
    title: str
    description: str
    status: ComplaintStatus
    priority: ComplaintPriority
    category: ComplaintCategory
    assigned_agent_id: Optional[str]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class ComplaintListResponse(BaseModel):
    model_config = {"from_attributes": True}

    items: list[ComplaintResponse]
    total: int
    page: int
    page_size: int
