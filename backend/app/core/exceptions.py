"""
HealthLens AI — Custom Exception Hierarchy
==========================================
All API errors inherit from HTTPException and provide a clear, consistent JSON
payload. The FastAPI exception handler converts them to the standard
FastAPI error format used across the project.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from typing import Any


class APIError(HTTPException):
    """Base class for all custom API errors.

    Attributes:
        detail: Human‑readable error message.
        status_code: HTTP status code (defaults to 400).
        payload: Optional extra data to include in the JSON response.
    """

    def __init__(self, *, status_code: int = status.HTTP_400_BAD_REQUEST, detail: str, payload: dict[str, Any] | None = None) -> None:
        super().__init__(status_code=status_code, detail=detail)
        self.payload = payload or {}

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON‑serialisable representation of the error.

        FastAPI will automatically use ``detail`` as the top‑level error message.
        The optional ``payload`` can contain field‑level validation errors or
        debugging hints.
        """
        return {"error": self.detail, **self.payload}


class NotFoundError(APIError):
    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} with identifier {identifier} not found.")


class UnauthorizedError(APIError):
    def __init__(self, detail: str = "Unauthorized access") -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenError(APIError):
    def __init__(self, detail: str = "Forbidden") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ValidationError(APIError):
    def __init__(self, errors: dict[str, Any]) -> None:
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Validation error", payload={"fields": errors})
