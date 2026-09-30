"""
AI Provider Factory.
"""
from app.services.ai.base import AIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def get_ai_provider() -> AIProvider:
    """Select and return the configured Gemini AI provider."""
    return GeminiProvider()
