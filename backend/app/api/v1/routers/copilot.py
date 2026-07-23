from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from typing import Optional
from app.application.services.copilot_service import CopilotService
from app.domain.schemas.copilot import CopilotResponse
from app.api.v1.deps import get_current_user
from app.domain.models.user import User

router = APIRouter(prefix="/ai/copilot", tags=["copilot"])


def _svc() -> CopilotService:
    return CopilotService()


@router.post("/text", response_model=CopilotResponse)
async def extract_from_text(
    text: str = Form(..., min_length=10),
    _: User = Depends(get_current_user),
    svc: CopilotService = Depends(_svc),
):
    try:
        return await svc.extract_from_text(text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/upload", response_model=CopilotResponse)
async def extract_from_file(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
    svc: CopilotService = Depends(_svc),
):
    try:
        return await svc.extract_from_file(file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
