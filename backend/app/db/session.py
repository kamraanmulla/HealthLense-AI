"""
HealthLens AI — DB Session
===========================
Thin module that exposes the SessionLocal factory and get_db dependency.
The engine and Base live in ``app.core.database`` to avoid circular imports.
This module re-exports them for the ``app/db/`` namespace used by Alembic.
"""

from app.core.database import SessionLocal, engine, get_db

__all__ = ["SessionLocal", "engine", "get_db"]
