from pydantic import BaseModel, Field
from typing import Optional


class PipelineRequest(BaseModel):
    complaint_id: str
    title: str = Field(min_length=5)
    description: str = Field(min_length=10)
    category: str = "other"
    existing_complaints: list[str] = Field(default_factory=list)


class ExtractionResult(BaseModel):
    title: str
    description: str
    keywords: list[str]
    entities: list[str]


class CompletenessResult(BaseModel):
    score: float                    # 0.0 – 1.0
    missing_fields: list[str]
    reasoning: str


class RiskResult(BaseModel):
    sentiment: str
    sentiment_score: float
    risk_level: str
    suggested_category: str
    suggested_priority: str


class RCAResult(BaseModel):
    root_cause: str
    contributing_factors: list[str]


class CapaResult(BaseModel):
    corrective_actions: list[str]
    preventive_actions: list[str]
    timeline_days: Optional[int]


class Explanations(BaseModel):
    """Per-node AI reasoning — explains every decision in plain language."""
    extraction: str = ""
    validation: str = ""
    completeness: str = ""
    duplicate_detection: str = ""
    summary: str = ""
    risk_classification: str = ""
    root_cause: str = ""
    capa: str = ""


class PipelineResponse(BaseModel):
    complaint_id: str
    pipeline_status: str
    is_valid: bool
    is_duplicate: bool
    duplicate_of: Optional[str]
    similarity_score: float
    validation_issues: list[str]
    extraction: ExtractionResult
    completeness: CompletenessResult
    summary: str
    risk: RiskResult
    root_cause_analysis: RCAResult
    capa: CapaResult
    suggested_response: str
    explanations: Explanations
    errors: list[str]


# ── Standalone completeness endpoint ──────────────────────────────────

class CompletenessRequest(BaseModel):
    complaint_id: str
    title: str
    description: str
    category: str = "other"


class CompletenessResponse(BaseModel):
    complaint_id: str
    score: float
    missing_fields: list[str]
    reasoning: str
