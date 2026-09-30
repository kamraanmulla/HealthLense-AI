"""
HealthLens AI — v1 Router Aggregator
======================================
Collects all v1 endpoint routers and mounts them under a single
``api_v1_router`` that is registered on the main FastAPI app.

To add a new feature:
1. Create a new router module under ``app/api/v1/``.
2. Import the router here and call ``api_v1_router.include_router()``.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.reports import router as reports_router
from app.api.v1.profile import router as profile_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router, prefix="/health", tags=["Health"])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_v1_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
