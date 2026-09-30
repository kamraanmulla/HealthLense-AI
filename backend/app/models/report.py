"""
HealthLens AI — Report ORM Models
===================================
Two tables:
  • ``Report``           — one row per uploaded medical report.
  • ``ReportParameter``  — child rows for each extracted blood parameter.

Design decisions
----------------
- UUIDs are stored as VARCHAR(36) for SQLite compatibility.
- JSON blobs (``ai_result``, ``raw_ocr_text``) use SQLAlchemy's JSON type.
- ``risk_level`` is stored as a plain string; the application layer enforces
  the allowed values ("LOW", "MODERATE", "HIGH").
- Soft-delete is implemented via ``is_deleted`` so report history is preserved
  in the database even after a user deletes a report from the UI.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Report(Base):
    """Represents a single uploaded and processed medical report."""

    __tablename__ = "reports"

    # ── Primary key ────────────────────────────────────────────────────────────
    id: str = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )

    # ── Ownership ──────────────────────────────────────────────────────────────
    user_id: int = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── File metadata ──────────────────────────────────────────────────────────
    original_filename: str = Column(String(255), nullable=False)
    stored_filename: str = Column(String(255), nullable=False, unique=True)
    file_path: str = Column(String(512), nullable=False)
    file_type: str = Column(String(10), nullable=False)   # "pdf" | "png" | "jpg" | "jpeg"
    file_size_bytes: int = Column(Integer, nullable=False)

    # ── Processing status ─────────────────────────────────────────────────────
    # "pending" → "processing" → "completed" | "failed"
    status: str = Column(String(20), nullable=False, default="pending", index=True)
    error_message: str | None = Column(Text, nullable=True)

    # ── OCR output ─────────────────────────────────────────────────────────────
    raw_ocr_text: str | None = Column(Text, nullable=True)

    # ── Analysis results ───────────────────────────────────────────────────────
    health_score: float | None = Column(Float, nullable=True)
    health_grade: str | None = Column(String(10), nullable=True) # A+, A, B, C, D, Critical
    risk_level: str | None = Column(String(20), nullable=True)  # LOW | MODERATE | HIGH | CRITICAL
    confidence_pct: int | None = Column(Integer, nullable=True)
    ai_result: dict | None = Column(JSON, nullable=True)         # full AI response blob

    # ── Soft delete ────────────────────────────────────────────────────────────
    is_deleted: bool = Column(Boolean, nullable=False, default=False, index=True)

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at: datetime = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: datetime | None = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True,
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    user = relationship("User", back_populates="reports", lazy="select")
    parameters = relationship(
        "ReportParameter",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="ReportParameter.name",
    )

    # ── Composite indexes ──────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_reports_user_created", "user_id", "created_at"),
        Index("ix_reports_user_deleted", "user_id", "is_deleted"),
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id!r} user_id={self.user_id} status={self.status!r}>"


class ReportParameter(Base):
    """
    One row per extracted blood parameter within a report.

    Storing parameters in a child table (rather than a JSON array) enables
    efficient querying, charting across multiple reports, and future
    aggregation without unpacking JSON blobs.
    """

    __tablename__ = "report_parameters"

    # ── Primary key ────────────────────────────────────────────────────────────
    id: int = Column(Integer, primary_key=True, autoincrement=True)

    # ── Foreign key ────────────────────────────────────────────────────────────
    report_id: str = Column(
        String(36),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Parameter data ─────────────────────────────────────────────────────────
    name: str = Column(String(100), nullable=False)          # e.g. "Haemoglobin"
    value: float | None = Column(Float, nullable=True)       # numeric extracted value
    unit: str | None = Column(String(30), nullable=True)     # e.g. "g/dL"
    reference_min: float | None = Column(Float, nullable=True)
    reference_max: float | None = Column(Float, nullable=True)
    reference_text: str | None = Column(String(100), nullable=True)  # e.g. "12.0–16.0"
    status: str = Column(String(10), nullable=False, default="normal")  # low | normal | high
    confidence_score: float | None = Column(Float, nullable=True) # OCR confidence 0.0 to 1.0

    # ── Relationship ───────────────────────────────────────────────────────────
    report = relationship("Report", back_populates="parameters")

    __table_args__ = (
        Index("ix_report_parameters_report_name", "report_id", "name"),
    )

    def __repr__(self) -> str:
        return (
            f"<ReportParameter report_id={self.report_id!r} "
            f"name={self.name!r} value={self.value} status={self.status!r}>"
        )
