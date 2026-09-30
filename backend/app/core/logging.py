"""
HealthLens AI — Structured Logging
====================================
Configures structlog for JSON-structured, level-aware logging.
Call `configure_logging()` once at application startup.
"""

from __future__ import annotations

import logging
import sys

import structlog

from app.core.config import get_settings


def configure_logging() -> None:
    """
    Configure structlog with appropriate processors for the current environment.

    - Development: human-readable coloured console output
    - Production: machine-readable JSON (suitable for log aggregators)
    """
    # Prevent Windows console charmap UnicodeEncodeError
    if sys.stdout and hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if sys.stderr and hasattr(sys.stderr, "reconfigure"):
        try:
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    settings = get_settings()

    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
    ]

    if settings.debug:
        renderer = structlog.dev.ConsoleRenderer(colors=True)
    else:
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.DEBUG if settings.debug else logging.INFO
        ),
        context_class=dict,

        # FIXED: Changed PrintLoggerFactory to LoggerFactory
        logger_factory=structlog.stdlib.LoggerFactory(),

        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    log_level = logging.DEBUG if settings.debug else logging.INFO

    logging.basicConfig(
        level=log_level,
        stream=sys.stdout,
        format="%(message)s",
    )

    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.debug else logging.WARNING
    )


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    """Return a bound structlog logger for the given module name."""
    return structlog.get_logger(name)