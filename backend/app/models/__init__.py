"""
HealthLens AI — Models Package
================================
Single import point for all ORM models. Importing this package guarantees
that every model's ``__tablename__`` is registered with ``Base.metadata``
before Alembic or ``create_all()`` is called.

Import order: ``User`` before ``Report`` because ``Report`` holds the FK.
The relationship between them is declared with string references inside each
model file, so there is no circular dependency.
"""

from __future__ import annotations

from app.models.user import User, UserProfile
from app.models.report import Report, ReportParameter

__all__ = ["User", "UserProfile", "Report", "ReportParameter"]
