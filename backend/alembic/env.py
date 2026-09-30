"""
Alembic Migration Environment
================================
Configures Alembic's online and offline migration modes using the
application's Pydantic settings so the database URL is never hard-coded.

Offline mode:  generates SQL scripts without a live DB connection.
Online mode:   runs migrations directly against the configured database.
"""

from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ── Import app settings and all models ───────────────────────────────────────
# db.base imports Base AND every ORM model, so autogenerate can detect tables.
from app.core.config import get_settings
from app.db.base import Base  # noqa: F401 — registers all model metadata

settings = get_settings()

# ── Alembic Config object (provides access to alembic.ini values) ─────────────
config = context.config

# Override the sqlalchemy.url from alembic.ini with the value from .env.
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging if present.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The MetaData object Alembic compares against.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    In this mode, Alembic emits SQL to stdout rather than connecting
    to the database. Useful for generating migration scripts for review.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    A real database connection is established and migrations are applied
    transactionally.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            # Render batch mode for SQLite ALTER TABLE compatibility.
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
