"""
HealthLens AI — User ORM Model
================================
Authentication and identity model. The ``reports`` relationship uses a
string reference (``"Report"``) to avoid a circular import with
``app.models.report`` while still enabling SQLAlchemy's relationship loading.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Float, Text, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """Registered user account."""

    __tablename__ = "users"

    # ── Identity ───────────────────────────────────────────────────────────────
    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email: str = Column(String(255), unique=True, index=True, nullable=False)
    full_name: str | None = Column(String(150), nullable=True)

    # ── Auth ───────────────────────────────────────────────────────────────────
    hashed_password: str = Column(String(255), nullable=False)
    is_active: bool = Column(Boolean, nullable=False, default=True)
    is_superuser: bool = Column(Boolean, nullable=False, default=False)

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
    # String reference avoids circular import with report.py.
    reports = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="Report.created_at.desc()",
    )
    
    profile = relationship(
        "UserProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )

    measurement_history = relationship(
        "UserMeasurementHistory",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="UserMeasurementHistory.recorded_at.desc()",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} active={self.is_active}>"


class UserProfile(Base):
    """User health profile containing demographics, medical history, and lifestyle data."""

    __tablename__ = "user_profiles"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # ── Personal Information ──────────────────────────────────────────────────
    age: int | None = Column(Integer, nullable=True)
    dob: str | None = Column(String(50), nullable=True)  # YYYY-MM-DD
    gender: str | None = Column(String(50), nullable=True)

    # ── Body Information ──────────────────────────────────────────────────────
    height: float | None = Column(Float, nullable=True)
    height_unit: str | None = Column(String(10), default="cm", nullable=True)
    weight: float | None = Column(Float, nullable=True)
    weight_unit: str | None = Column(String(10), default="kg", nullable=True)
    bmi: float | None = Column(Float, nullable=True)

    # ── Medical Background ────────────────────────────────────────────────────
    medical_conditions: str | None = Column(Text, nullable=True)
    previous_surgeries: str | None = Column(Text, nullable=True)
    allergies: str | None = Column(Text, nullable=True)
    medications: str | None = Column(Text, nullable=True)
    family_history: str | None = Column(Text, nullable=True)
    major_medical_events: str | None = Column(Text, nullable=True)

    # ── Lifestyle ─────────────────────────────────────────────────────────────
    activity_level: str | None = Column(String(100), nullable=True)  # Sedentary, Lightly Active, Moderately Active, Very Active
    exercise_frequency: str | None = Column(String(100), nullable=True)
    sleep_information: str | None = Column(String(255), nullable=True)  # Average sleep duration / sleep quality
    smoking_status: str | None = Column(String(100), nullable=True)
    alcohol_consumption: str | None = Column(String(100), nullable=True)

    # ── Health Context ────────────────────────────────────────────────────────
    health_concerns: str | None = Column(Text, nullable=True)
    health_goals: str | None = Column(Text, nullable=True)
    dietary_preference: str | None = Column(String(100), nullable=True)

    # ── Onboarding State ──────────────────────────────────────────────────────
    onboarding_completed: bool = Column(Boolean, default=False, nullable=False)

    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: datetime | None = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user = relationship("User", back_populates="profile")


class UserMeasurementHistory(Base):
    """
    Historical log of naturally changing personal profile measurements (e.g. weight).
    Maintains chronological record without fabricating any data points.
    """

    __tablename__ = "user_measurement_history"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    measurement_type: str = Column(String(50), nullable=False)  # "weight", "height", "bmi"
    value: float = Column(Float, nullable=False)
    unit: str = Column(String(20), nullable=False)
    recorded_at: datetime = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="measurement_history")
