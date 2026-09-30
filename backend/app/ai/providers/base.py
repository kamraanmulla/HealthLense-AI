"""
Abstract AI provider interface.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any

class AIProvider(ABC):
    """Base interface for all AI providers."""
    
    @abstractmethod
    async def generate(self, prompt: str) -> Dict[str, Any]:
        """Generate analysis from the prompt."""
        pass
        
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is available."""
        pass
