from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse


class TokenResponse(BaseModel):
    """OAuth2 JWT token response schema."""
    access_token: str = Field(..., description="JWT access token string")
    token_type: str = Field(default="bearer", description="Token type, typically bearer")
    expires_in: int = Field(..., description="Token expiration in seconds")
    user: UserResponse = Field(..., description="Authenticated user profile")


class LoginRequest(BaseModel):
    """Email and password login request schema."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Account password")


class RegisterRequest(BaseModel):
    """User registration request schema."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Account password (min 6 characters)")
    full_name: Optional[str] = Field(None, description="Full display name")
    phone_number: Optional[str] = Field(None, description="Contact telephone number")
    is_advocate: bool = Field(default=False, description="Whether the user is a legal practitioner / advocate")


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile info."""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_advocate: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, description="Optional new password")
