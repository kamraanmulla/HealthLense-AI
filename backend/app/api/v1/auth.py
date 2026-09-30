"""
HealthLens AI — Auth Router
=============================
Handles user registration, login, token refresh, and profile management.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.core.exceptions import UnauthorizedError
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_user_id_from_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    TokenRefreshRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.schemas.common import MessageResponse
from jose import JWTError

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Creates a new user with a bcrypt-hashed password. Returns the public user profile.",
)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)) -> User:
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("auth.user_registered", user_id=user.id, email=user.email)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and obtain JWT tokens",
    description="Validates credentials and returns an access token + refresh token pair.",
)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate a user and issue JWT tokens."""
    user: User | None = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        logger.warning("auth.login_failed", email=payload.email)
        raise UnauthorizedError(detail="Incorrect email or password.")
    if not user.is_active:
        raise UnauthorizedError(detail="This account has been deactivated.")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    logger.info("auth.login_success", user_id=user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Accepts a valid refresh token and issues a new access + refresh token pair.",
)
def refresh_token(payload: TokenRefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Rotate tokens using a valid refresh token."""
    try:
        user_id = get_user_id_from_token(payload.refresh_token, expected_type="refresh")
    except JWTError:
        raise UnauthorizedError(detail="Refresh token is invalid or has expired.")

    user: User | None = db.get(User, user_id)
    if not user or not user.is_active:
        raise UnauthorizedError(detail="User not found or account is inactive.")

    logger.info("auth.tokens_refreshed", user_id=user.id)
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns the authenticated user's public profile.",
)
def get_me(current_user: User = Depends(get_active_user)) -> UserResponse:
    """Return the current user's profile."""
    onboarding_done = bool(current_user.profile and current_user.profile.onboarding_completed)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        onboarding_completed=onboarding_done,
        created_at=current_user.created_at,
    )


@router.delete(
    "/me",
    response_model=MessageResponse,
    summary="Deactivate account",
    description="Soft-deactivates the authenticated user's account.",
)
def deactivate_me(
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Deactivate (soft-delete) the current user's account."""
    current_user.is_active = False
    db.commit()
    logger.info("auth.account_deactivated", user_id=current_user.id)
    return MessageResponse(message="Account has been deactivated.")
