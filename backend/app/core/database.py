"""
HealthLens AI — Database Utilities
====================================
SQLAlchemy 2.x engine, session factory, declarative Base, and the
``get_db`` FastAPI dependency.

Design notes
------------
- ``check_same_thread=False`` is required for SQLite (one connection shared
  across the async worker thread pool).
- ``expire_on_commit=False`` keeps ORM instances usable after ``db.commit()``
  without issuing an extra SELECT on next attribute access.
- ``get_db`` is a plain synchronous generator — FastAPI wraps it in a
  thread-pool executor automatically.
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


def _build_engine():
    settings = get_settings()
    kwargs = {}
    if "sqlite" in settings.database_url:
        kwargs["connect_args"] = {"check_same_thread": False}
    return create_engine(
        settings.database_url,
        echo=settings.debug,
        **kwargs,
    )


engine = _build_engine()

SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """
    Declarative base for all ORM models.

    Every model that inherits from ``Base`` is automatically registered
    with ``Base.metadata``, which Alembic uses for autogenerate.
    """


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session scoped to a request.

    Usage::

        @router.get("/items")
        def read_items(db: Session = Depends(get_db)):
            ...

    The session is always closed in the ``finally`` block, even if an
    exception propagates out of the route handler.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
