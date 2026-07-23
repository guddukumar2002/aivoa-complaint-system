from fastapi import APIRouter
from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.complaints import router as complaints_router
from app.api.v1.routers.upload import router as upload_router
from app.api.v1.routers.ai import router as ai_router
from app.api.v1.routers.copilot import router as copilot_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(complaints_router)
api_router.include_router(upload_router)  # prefix: /complaints/{complaint_id}/documents
api_router.include_router(ai_router)
api_router.include_router(copilot_router)
