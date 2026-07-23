"""
LangGraph complaint analysis pipeline.

Workflow
--------
                    ┌──────────────────────────────────────────────────────────┐
                    │                                                          │
  START → extract → validate ──(invalid)──────────────────────────────────→ format_output → END
                        │                                                        ↑
                     (valid)                                                      │
                        ↓                                                        │
               completeness → duplicate_detect ──(duplicate)──────────────────→ ┤
                                    │                                            │
                                (unique)                                         │
                                    ↓                                            │
               generate_summary → risk_classify → root_cause → capa ──────────→ ┘

Key design choices
------------------
- Graph is compiled ONCE at module level (compile() is expensive).
- Every node returns a partial dict — LangGraph merges it into state.
- Annotated[list, operator.add] fields accumulate across nodes (errors, validation_issues).
- Conditional edges keep the graph acyclic and fast for invalid/duplicate inputs.
- completeness runs for ALL valid complaints (even duplicates) so the score is always available.
"""

from langgraph.graph import StateGraph, END
from app.ai.state import ComplaintState
from app.ai.nodes.extract import extract_complaint
from app.ai.nodes.validate import validate_complaint
from app.ai.nodes.completeness import check_completeness
from app.ai.nodes.duplicate_detect import duplicate_detect
from app.ai.nodes.generate_summary import generate_summary
from app.ai.nodes.risk_classify import risk_classify
from app.ai.nodes.root_cause import root_cause
from app.ai.nodes.capa import capa
from app.ai.nodes.format_output import format_output


# ── Conditional routing functions ─────────────────────────────────────

def _route_after_validate(state: ComplaintState) -> str:
    """Skip heavy nodes if complaint is invalid."""
    return "completeness" if state.get("is_valid", True) else "format_output"


def _route_after_duplicate(state: ComplaintState) -> str:
    """Skip analysis if complaint is a duplicate."""
    return "format_output" if state.get("is_duplicate", False) else "generate_summary"


# ── Graph construction ─────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    g = StateGraph(ComplaintState)

    # Register nodes
    g.add_node("extract", extract_complaint)
    g.add_node("validate", validate_complaint)
    g.add_node("completeness", check_completeness)
    g.add_node("duplicate_detect", duplicate_detect)
    g.add_node("generate_summary", generate_summary)
    g.add_node("risk_classify", risk_classify)
    g.add_node("root_cause_analysis", root_cause)
    g.add_node("capa", capa)
    g.add_node("format_output", format_output)

    # Linear edges
    g.set_entry_point("extract")
    g.add_edge("extract", "validate")
    g.add_edge("completeness", "duplicate_detect")
    g.add_edge("generate_summary", "risk_classify")
    g.add_edge("risk_classify", "root_cause_analysis")
    g.add_edge("root_cause_analysis", "capa")
    g.add_edge("capa", "format_output")
    g.add_edge("format_output", END)

    # Conditional edges
    g.add_conditional_edges(
        "validate",
        _route_after_validate,
        {"completeness": "completeness", "format_output": "format_output"},
    )
    g.add_conditional_edges(
        "duplicate_detect",
        _route_after_duplicate,
        {"generate_summary": "generate_summary", "format_output": "format_output"},
    )

    return g


# Compiled once — reused for every request
complaint_graph = _build_graph().compile()
