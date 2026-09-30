"""
HealthLens AI — Authentication Schemas
=========================================
Pydantic v2 models for all auth-related request and response payloads.

Validation rules
----------------
- Password must be 8–128 characters and must not be entirely numeric.
- Email is normalised to lowercase via a field validator.
- Sensitive fields (hashed_password, etc.) are never exposed in responses.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ValidationInfo, field_validator


class UserRegisterRequest(BaseModel):
    """Request body for POST /api/v1/auth/register."""

    email: EmailStr = Field(
        ...,
        description="Valid email address used as the login identifier.",
    )
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="User's display name.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (8–128 characters).",
    )

    @field_validator("email", mode="before")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        """Lowercase and strip whitespace from email."""
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        """Reject passwords that consist entirely of digits."""
        if v.isdigit():
            raise ValueError("Password must not consist of digits only.")
        return v


class UserLoginRequest(BaseModel):
    """Request body for POST /api/v1/auth/login."""

    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., min_length=1, description="Account password.")

    @field_validator("email", mode="before")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class TokenRefreshRequest(BaseModel):
    """Request body for POST /api/v1/auth/refresh."""

    refresh_token: str = Field(
        ...,
        description="A valid refresh token previously issued by the server.",
    )


class TokenResponse(BaseModel):
    """Successful authentication response containing JWT tokens."""

    access_token: str = Field(..., description="Short-lived JWT access token.")
    refresh_token: str = Field(..., description="Long-lived JWT refresh token.")
    token_type: str = Field("bearer", description="OAuth2 token type.")


class UserResponse(BaseModel):
    """Public user profile returned after registration or at /me."""

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    onboarding_completed: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    """Request body for PATCH /api/v1/auth/me."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    current_password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="Required when changing the password.",
    )
    new_password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="New password (requires current_password to be set).",
    )

    @field_validator("new_password")
    @classmethod
    def new_password_needs_current(
        cls, v: Optional[str], info: ValidationInfo
    ) -> Optional[str]:
        """Ensure current_password is supplied whenever new_password is provided."""
        if v is not None and not (info.data or {}).get("current_password"):
            raise ValueError(
                "current_password is required when setting a new_password."
            )
        return v
