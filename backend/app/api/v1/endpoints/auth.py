from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    LoginRequest,
    RegisterRequest,
    UserProfileUpdate,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user account")
def register_user(
    register_in: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Registers a new consumer or legal advocate account, hashes password securely via bcrypt,
    and returns an OAuth2 JWT Bearer token + profile.
    Part of **Milestone 2: Authentication and database**.
    """
    user = AuthService.register_user(db, register_in)
    return AuthService.create_user_token(user)


@router.post("/login", response_model=TokenResponse, summary="Login with email & password")
def login_user(
    login_in: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticates a user using email and password and returns a JWT access token.
    Part of **Milestone 2: Authentication and database**.
    """
    user = AuthService.authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return AuthService.create_user_token(user)


@router.post("/token", response_model=TokenResponse, summary="OAuth2 token login (Form-urlencoded for Swagger UI)")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2 standard form-urlencoded login endpoint for OpenAPI interactive `/docs` testing.
    Part of **Milestone 2: Authentication and database**.
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return AuthService.create_user_token(user)


@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns the active authenticated user's profile and account preferences.
    Part of **Milestone 2: Authentication and database**.
    """
    return current_user


@router.put("/me", response_model=UserResponse, summary="Update current authenticated user profile")
def update_current_user_profile(
    update_in: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Updates profile details (full name, phone number, advocate status, password).
    Part of **Milestone 2: Authentication and database**.
    """
    return AuthService.update_profile(db, current_user, update_in)
