from __future__ import annotations
import operator
from typing import Annotated, Optional
from typing_extensions import TypedDict


class ComplaintState(TypedDict, total=False):
    # ── Input ──────────────────────────────────────────────────────────
    complaint_id: str
    title: str
    description: str
    category: str
    existing_complaints: list[str]   # titles of recent complaints for duplicate check

    # ── Extraction ─────────────────────────────────────────────────────
    extracted_title: str
    extracted_description: str
    extracted_keywords: list[str]
    extracted_entities: list[str]
    extract_reasoning: str           # why the LLM extracted what it did

    # ── Validation ─────────────────────────────────────────────────────
    is_valid: bool
    validation_issues: Annotated[list[str], operator.add]
    validate_reasoning: str          # explanation of validation decision

    # ── Completeness ───────────────────────────────────────────────────
    completeness_score: float        # 0.0 – 1.0
    completeness_missing: list[str]  # list of missing/weak fields
    completeness_reasoning: str      # explanation of completeness assessment

    # ── Duplicate Detection ────────────────────────────────────────────
    is_duplicate: bool
    duplicate_of: Optional[str]
    similarity_score: float
    duplicate_reasoning: str         # explanation of duplicate decision

    # ── Summary ────────────────────────────────────────────────────────
    summary: str
    summary_reasoning: str           # key points the summary is based on

    # ── Risk Classification ────────────────────────────────────────────
    sentiment: str                   # positive | neutral | negative
    sentiment_score: float           # 0.0 – 1.0
    risk_level: str                  # low | medium | high | critical
    suggested_category: str
    suggested_priority: str
    risk_reasoning: str              # explanation of risk/sentiment decision

    # ── Root Cause ─────────────────────────────────────────────────────
    root_cause: str
    contributing_factors: list[str]
    root_cause_reasoning: str        # 5-Why chain or evidence cited

    # ── CAPA ───────────────────────────────────────────────────────────
    corrective_actions: list[str]
    preventive_actions: list[str]
    capa_timeline_days: Optional[int]
    capa_reasoning: str              # rationale for chosen actions

    # ── Final Output ───────────────────────────────────────────────────
    suggested_response: str
    final_output: dict

    # ── Error Accumulator ──────────────────────────────────────────────
    errors: Annotated[list[str], operator.add]
