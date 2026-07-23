from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.domain.models.user import User
from app.domain.schemas.ai_request import (
    AIAnalyzeRequest, AIAnalyzeResponse,
    AISummaryRequest, AISummaryResponse,
    AIRootCauseRequest, AIRootCauseResponse,
    AICapaRequest, AICapaResponse,
)
from app.application.services.ai_service import AIService
from app.application.services.langgraph_service import LangGraphService
from app.domain.schemas.pipeline import PipelineRequest, PipelineResponse, CompletenessRequest, CompletenessResponse
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


def _svc(db: Session = Depends(get_db)) -> AIService:
    return AIService(db)


@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze(
    req: AIAnalyzeRequest,
    svc: AIService = Depends(_svc),
    _: User = Depends(get_current_user),
):
    return svc.analyze(req)


@router.post("/summary", response_model=AISummaryResponse)
def summary(
    req: AISummaryRequest,
    svc: AIService = Depends(_svc),
    _: User = Depends(get_current_user),
):
    return svc.summary(req)


@router.post("/root-cause", response_model=AIRootCauseResponse)
def root_cause(
    req: AIRootCauseRequest,
    svc: AIService = Depends(_svc),
    _: User = Depends(get_current_user),
):
    return svc.root_cause(req)


@router.post("/capa", response_model=AICapaResponse)
def capa(
    req: AICapaRequest,
    svc: AIService = Depends(_svc),
    _: User = Depends(get_current_user),
):
    return svc.capa(req)


@router.post("/completeness", response_model=CompletenessResponse)
def completeness(
    req: CompletenessRequest,
    svc: AIService = Depends(_svc),
    _: User = Depends(get_current_user),
):
    return svc.completeness(req)


@router.post("/pipeline", response_model=PipelineResponse)
def run_pipeline(
    req: PipelineRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return LangGraphService(db).run(
        complaint_id=req.complaint_id,
        title=req.title,
        description=req.description,
        category=req.category,
        existing_complaints=req.existing_complaints,
    )
