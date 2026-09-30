"""
AI Service Layer.
Coordinates OCR, Parsing, AI Generation, and Database Updates.
DEPRECATED: This module is deprecated. Use app.services.report_service instead.
"""
import asyncio
from app.core.logging import get_logger
from app.services.report_service import process_report_background

logger = get_logger(__name__)

async def process_report(report_id: str) -> None:
    """
    Main background task for processing a report.
    Redirecting to the unified pipeline in app.services.report_service.
    """
    logger.info("healthlens.ai.service_redirect", report_id=report_id, msg="Redirecting to app.services.report_service.process_report_background")
    await process_report_background(report_id)
