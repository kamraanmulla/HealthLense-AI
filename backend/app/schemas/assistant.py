"""
HealthLens AI — Schemas for AI Health Assistant API
===================================================
Models for conversational health education, grounded clinical explanation,
and report-aware Q&A.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssistantMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class AssistantChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000, description="User question or health inquiry")
    report_id: Optional[str] = Field(None, description="Optional report ID to ground answers against verified lab metrics")
    history: Optional[List[AssistantMessage]] = Field(default_factory=list, description="Recent conversation turns")


class AssistantChatResponse(BaseModel):
    reply: str
    classified_intent: str
    referenced_biomarkers: List[str]
    is_report_specific: bool
    grounded_parameters_count: int
    disclaimer: str = (
        "HealthLens AI provides informational and educational explanations only. "
        "It does not provide medical diagnoses, treatment prescriptions, or emergency clinical guidance. "
        "Always review concerns with a qualified healthcare professional."
    )
