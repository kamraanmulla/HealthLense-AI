from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class AIProvider(ABC):
    @abstractmethod
    async def analyze_report(
        self,
        report_text: str,
        user_profile: Optional[Dict[str, Any]] = None,
        previous_reports: Optional[List[Dict[str, Any]]] = None,
        detected_conditions: Optional[List[Dict[str, Any]]] = None,
        deterministic_recommendations: Optional[Dict[str, List[str]]] = None,
        ml_findings: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Analyzes the medical report text and returns a dictionary matching
        the required structured JSON schema.
        """
        pass

    @abstractmethod
    async def chat_with_report(self, report_context: Dict[str, Any], question: str) -> Dict[str, str]:
        """
        Answers a user's question based strictly on the provided report context.
        """
        pass
