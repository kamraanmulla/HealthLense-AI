"""
HealthLens AI — Database Initialisation
=========================================
Called once at application startup (via the FastAPI lifespan handler).

Responsibilities
----------------
1. Create all tables defined in the ORM models (idempotent DDL).
2. Create the uploads directory if it does not exist.
3. Optionally seed a superuser from environment variables.

Alembic handles *migrations* in production; ``init_db`` is used for
development bootstrap and ensures the app is always in a runnable state.
"""

from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import engine
from app.core.logging import get_logger
from app.core.security import hash_password
from app.db.base import Base  # ensures all models are registered

logger = get_logger(__name__)


def init_db(db: Session | None = None) -> None:
    """
    Create all database tables and ensure required directories exist.

    This function is idempotent — safe to call multiple times.
    Tables that already exist are left untouched.

    Args:
        db: Optional SQLAlchemy Session (used for seeding operations).
    """
    settings = get_settings()

    # ── 1. Create tables ──────────────────────────────────────────────────────
    logger.info("init_db.creating_tables", database_url=settings.database_url)
    Base.metadata.create_all(bind=engine)
    logger.info("init_db.tables_ready")

    # ── 2. Ensure upload directory exists ─────────────────────────────────────
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    logger.info("init_db.upload_dir_ready", path=str(upload_path.resolve()))

    # ── 3. Ensure logs directory exists ───────────────────────────────────────
    Path("logs").mkdir(parents=True, exist_ok=True)
