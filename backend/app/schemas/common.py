"""
HealthLens AI — Common Schemas
================================
Shared Pydantic v2 models reused across the entire API surface.
"""

from __future__ import annotations

from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class MessageResponse(BaseModel):
    """Generic success message returned by non-data endpoints."""

    message: str = Field(..., examples=["Operation completed successfully."])


class ErrorDetail(BaseModel):
    """Structured error detail for validation failures."""

    field: Optional[str] = Field(None, description="Name of the field that caused the error.")
    message: str = Field(..., description="Human-readable error description.")


class ErrorResponse(BaseModel):
    """Standard error envelope returned by all exception handlers."""

    error: str = Field(..., description="Short error code or summary.")
    details: Optional[List[ErrorDetail]] = Field(None, description="Field-level validation errors, if any.")


class PaginationMeta(BaseModel):
    """Pagination metadata included in paginated responses."""

    total: int = Field(..., ge=0, description="Total number of items matching the query.")
    page: int = Field(..., ge=1, description="Current page number (1-indexed).")
    per_page: int = Field(..., ge=1, le=100, description="Number of items per page.")
    pages: int = Field(..., ge=0, description="Total number of pages.")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Generic paginated response wrapper."""

    data: List[DataT]
    meta: PaginationMeta


class HealthCheck(BaseModel):
    """Response model for the /health endpoint."""

    status: str = Field("ok", description="Service status.")
    version: str = Field(..., description="Application version string.")
    environment: str = Field(..., description="Deployment environment name.")
