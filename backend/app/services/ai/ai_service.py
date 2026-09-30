from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.ai.base import AIProvider

logger = get_logger(__name__)

def get_ai_provider() -> AIProvider:
    """Factory function to instantiate the configured AI provider."""
    settings = get_settings()
    provider_name = (settings.ai_provider or "gemini").lower()

    if provider_name == "gemini":
        from app.services.ai.gemini_provider import GeminiProvider
        return GeminiProvider()
    else:
        logger.warning(f"Provider '{provider_name}' requested. Defaulting to Gemini.")
        from app.services.ai.gemini_provider import GeminiProvider
        return GeminiProvider()
