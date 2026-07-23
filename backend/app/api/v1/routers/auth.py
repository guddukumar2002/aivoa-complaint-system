from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.domain.models.user import User
from app.domain.schemas.user import UserCreate, UserResponse, TokenResponse, LoginRequest
from app.application.services.auth_service import AuthService
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(payload)


@router.post("/login", response_model=TokenResponse)
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    return AuthService(db).login(username, password)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
