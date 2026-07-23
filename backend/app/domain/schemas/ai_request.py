from pydantic import BaseModel, Field
from typing import Optional


class AIAnalyzeRequest(BaseModel):
    complaint_id: str
    title: str
    description: str


class AISummaryRequest(BaseModel):
    complaint_id: str
    title: str
    description: str
    timeline: list[str] = Field(default_factory=list)


class AIRootCauseRequest(BaseModel):
    complaint_id: str
    title: str
    description: str
    category: str


class AICapaRequest(BaseModel):
    complaint_id: str
    title: str
    description: str
    root_cause: str


class AIAnalyzeResponse(BaseModel):
    complaint_id: str
    sentiment: str
    sentiment_score: float
    suggested_category: str
    suggested_priority: str
    summary: str
    suggested_response: str


class AISummaryResponse(BaseModel):
    complaint_id: str
    summary: str


class AIRootCauseResponse(BaseModel):
    complaint_id: str
    root_cause: str
    contributing_factors: list[str]


class AICapaResponse(BaseModel):
    complaint_id: str
    corrective_actions: list[str]
    preventive_actions: list[str]
    timeline_days: Optional[int]
