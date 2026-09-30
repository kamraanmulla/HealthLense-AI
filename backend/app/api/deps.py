"""
HealthLens AI — FastAPI Dependency Injection
=============================================
Reusable ``Depends()`` callables consumed by all route handlers.

Hierarchy
---------
  get_db           → yields a database session (per-request)
  get_current_user → decodes the JWT and loads the User from DB
  get_active_user  → asserts the user account is active
"""

from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.core.logging import get_logger
from app.core.security import get_user_id_from_token
from app.models.user import User

logger = get_logger(__name__)

# Swagger/OpenAPI Bearer Authentication
bearer_scheme = HTTPBearer(auto_error=False)


def _extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """
    Extract the raw JWT from the ``Authorization: Bearer <token>`` header.

    Raises:
        UnauthorizedError: If the header is missing or malformed.
    """
    if credentials is None:
        raise UnauthorizedError(
            detail="Invalid authentication credentials. Expected 'Bearer <token>'."
        )

    return credentials.credentials


def get_current_user(
    token: str = Depends(_extract_bearer_token),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT access token and return the authenticated user.
    """
    try:
        user_id = get_user_id_from_token(token, expected_type="access")
    except JWTError:
        raise UnauthorizedError(detail="Token is invalid or has expired.")

    user: User | None = db.get(User, user_id)

    if user is None:
        raise UnauthorizedError(detail="User not found.")

    return user


def get_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the authenticated user account is active.
    """
    if not current_user.is_active:
        raise UnauthorizedError(detail="This account has been deactivated.")

    return current_user