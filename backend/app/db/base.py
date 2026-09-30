"""
HealthLens AI — Alembic Base
==============================

This module imports Base and every ORM model so that Alembic's
env.py can discover all SQLAlchemy models through target_metadata.

Import order matters:
- Base must be imported first.
- Models must be imported after Base.
- Related models should be imported together to register relationships.
"""

from app.core.database import Base  # noqa: F401

# ── ORM models (SQLAlchemy table registration) ───────────────────────────────

from app.models.user import User, UserProfile  # noqa: F401
from app.models.report import Report, ReportParameter  # noqa: F401


__all__ = [
    "Base",
    "User",
    "UserProfile",
    "Report",
    "ReportParameter",
]