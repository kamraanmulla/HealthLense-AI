"""
HealthLens AI — FastAPI Application Entry Point
=================================================
Bootstraps the application with:
  • Lifespan context (DB init, logging, startup/shutdown hooks)
  • CORS middleware (origins from environment)
  • SlowAPI rate limiting
  • Global exception handlers (custom + Pydantic validation)
  • Swagger / ReDoc documentation (production-grade metadata)
  • All v1 API routers

This file should remain thin — business logic lives in services and routers.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1 import api_v1_router
from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.logging import configure_logging, get_logger
from app.db.init_db import init_db
from app.db.session import SessionLocal

settings = get_settings()
logger = get_logger(__name__)


# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan context manager.

    Startup:
        1. Initialise structured logging.
        2. Create all database tables and required directories.

    Shutdown:
        1. Log shutdown message (connection pools close automatically).
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    configure_logging()
    logger.info("healthlens.startup", version=settings.app_version, env=settings.environment)

    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

    logger.info("healthlens.ready")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("healthlens.shutdown")


# ── Application factory ───────────────────────────────────────────────────────
def create_application() -> FastAPI:
    """
    Build and return the configured FastAPI application instance.

    Separating construction into a factory function makes the app
    easily testable (instantiate a fresh app per test) and avoids
    module-level side-effects.
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "## HealthLens AI\n\n"
            "AI-Powered Medical Report Analyzer.\n\n"
            "> **Disclaimer**: This application is for **educational purposes only**. "
            "It does not provide medical diagnoses, prescriptions, or treatment advice. "
            "Always consult a qualified healthcare professional for medical concerns.\n\n"
            "### Features\n"
            "- Upload PDF / PNG / JPG medical blood reports\n"
            "- OCR extraction via Tesseract + OpenCV\n"
            "- AI-powered explanations via Google Gemini API\n"
            "- Health score & risk classification\n"
            "- Interactive analytics dashboard\n"
        ),
        terms_of_service="https://example.com/terms",
        contact={
            "name": "HealthLens AI Team",
            "email": "support@healthlens.ai",
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT",
        },
        openapi_tags=[
            {"name": "Health", "description": "Service health and readiness probes."},
            {"name": "Authentication", "description": "Register, login, and token management."},
            {"name": "Reports", "description": "Upload, process, and manage medical reports."},
            {"name": "Dashboard", "description": "Aggregate analytics and health timeline."},
        ],
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(api_v1_router)

    # ── Global exception handlers ─────────────────────────────────────────────
    _register_exception_handlers(app)

    return app


def _register_exception_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the application."""

    @app.exception_handler(APIError)
    async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
        """Handle all custom APIError subclasses with a consistent JSON envelope."""
        logger.warning(
            "api_error",
            status_code=exc.status_code,
            detail=exc.detail,
            path=str(request.url),
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail, **exc.payload},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Convert Pydantic v2 validation errors to a clean JSON structure."""
        errors = [
            {
                "field": ".".join(str(loc) for loc in err["loc"]),
                "message": err["msg"],
                "type": err["type"],
            }
            for err in exc.errors()
        ]
        logger.info("validation_error", errors=errors, path=str(request.url))
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": "Validation failed.", "details": errors},
        )

    @app.exception_handler(JWTError)
    async def jwt_error_handler(request: Request, exc: JWTError) -> JSONResponse:
        """Catch any unhandled JWT errors and return 401."""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Token is invalid or has expired."},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        """
        Catch-all for unexpected server errors.
        Logs the full traceback but returns a safe, generic message to the client.
        """
        logger.exception("unhandled_error", path=str(request.url), error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "An unexpected error occurred. Please try again later."},
        )


# ── Application instance ───────────────────────────────────────────────────────
app = create_application()
