"""
HealthLens AI — Security Utilities
====================================
JWT creation/verification, password hashing, and token helpers.
All cryptographic parameters come from Settings — never hard-coded.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── Password hashing ──────────────────────────────────────────────────────────
# bcrypt with auto-deprecation of weaker schemes.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        plain_password: The user-supplied password.

    Returns:
        A bcrypt hash string safe to store in the database.
    """
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against its bcrypt hash.

    Args:
        plain_password:   The user-supplied password.
        hashed_password:  The stored bcrypt hash.

    Returns:
        True if the password matches, False otherwise.
    """
    return _pwd_context.verify(plain_password, hashed_password)


# ── JWT tokens ────────────────────────────────────────────────────────────────

def _build_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    """
    Internal helper: create a signed JWT.

    Args:
        subject:       The token subject (user id as string).
        token_type:    "access" or "refresh".
        expires_delta: How long the token is valid.

    Returns:
        A signed JWT string.
    """
    settings = get_settings()
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": datetime.now(timezone.utc),
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(user_id: int) -> str:
    """
    Create a short-lived JWT access token for the given user.

    Args:
        user_id: Database primary key of the authenticated user.

    Returns:
        Signed JWT access token string.
    """
    settings = get_settings()
    return _build_token(
        subject=str(user_id),
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(user_id: int) -> str:
    """
    Create a long-lived JWT refresh token for the given user.

    Args:
        user_id: Database primary key of the authenticated user.

    Returns:
        Signed JWT refresh token string.
    """
    settings = get_settings()
    return _build_token(
        subject=str(user_id),
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token:          The raw JWT string.
        expected_type:  "access" or "refresh" — guards against token misuse.

    Returns:
        Decoded payload dictionary.

    Raises:
        JWTError: If the token is invalid, expired, or of the wrong type.
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        logger.warning("jwt_decode_failed", error=str(exc))
        raise

    token_type = payload.get("type")
    if token_type != expected_type:
        logger.warning(
            "jwt_type_mismatch",
            expected=expected_type,
            received=token_type,
        )
        raise JWTError(f"Token type mismatch: expected '{expected_type}', got '{token_type}'")

    return payload


def get_user_id_from_token(token: str, expected_type: str = "access") -> int:
    """
    Extract the integer user ID from a validated JWT.

    Args:
        token:          The raw JWT string.
        expected_type:  "access" or "refresh".

    Returns:
        The integer user ID encoded in the token's 'sub' field.

    Raises:
        JWTError: If decoding fails or 'sub' is missing.
    """
    payload = decode_token(token, expected_type)
    sub = payload.get("sub")
    if sub is None:
        raise JWTError("Token payload missing 'sub' claim.")
    return int(sub)
