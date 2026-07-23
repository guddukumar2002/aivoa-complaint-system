from pydantic import BaseModel
from typing import Optional


class CopilotResponse(BaseModel):
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    lot_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    severity: Optional[str] = None
    risk_level: Optional[str] = None
    root_cause: Optional[str] = None
    capa: Optional[str] = None
    summary: Optional[str] = None
    next_action: Optional[str] = None
    # Per-field confidence scores (0.0–1.0), keyed by field name
    confidence_scores: Optional[dict[str, float]] = None
