from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class AIAnalysisResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    complaint_id: str
    sentiment: Optional[str]
    sentiment_score: Optional[float]
    suggested_category: Optional[str]
    suggested_priority: Optional[str]
    summary: Optional[str]
    suggested_response: Optional[str]
    created_at: datetime
    updated_at: datetime
