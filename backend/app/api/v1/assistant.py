"""
HealthLens AI — Conversational AI Health Assistant API
======================================================
Provides report-aware and general health education Q&A powered by the
Clinical NLP Engine (Exp 9) and Google Gemini with strict factual grounding.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.core.logging import get_logger
from app.experiments.exp9_nlp_engine import ClinicalNLPEngine
from app.models.report import Report
from app.models.user import User
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.ai.ai_service import get_ai_provider

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/chat",
    response_model=AssistantChatResponse,
    summary="Interact with AI Health Assistant",
    description="Provides grounded, educational explanations for user inquiries with optional report context.",
)
async def chat_with_assistant(
    payload: AssistantChatRequest,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> AssistantChatResponse:
    nlp = ClinicalNLPEngine()
    ai_provider = get_ai_provider()

    verified_params: List[Dict[str, Any]] = []
    detected_conditions: List[str] = []
    is_report_specific = False

    # 1. If report_id supplied, enforce privacy & user isolation
    if payload.report_id:
        report = (
            db.query(Report)
            .filter(
                Report.id == payload.report_id,
                Report.user_id == current_user.id,
                Report.is_deleted == False,
            )
            .first()
        )
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected medical report not found or access denied.",
            )

        is_report_specific = True
        for p in report.parameters:
            verified_params.append({
                "parameter_name": p.name,
                "value": p.value,
                "unit": p.unit,
                "reference_range": p.reference_text or (f"{p.reference_min} - {p.reference_max}" if p.reference_min is not None else "N/A"),
                "status": p.status,
            })

        if report.ai_result and isinstance(report.ai_result, dict):
            for c in report.ai_result.get("detected_conditions", []):
                if isinstance(c, dict) and "condition" in c:
                    detected_conditions.append(c["condition"])

    # 2. NLP analysis & grounded prompt structuring
    nlp_result = nlp.build_grounded_assistant_prompt(
        user_question=payload.question,
        verified_parameters=verified_params,
        detected_conditions=detected_conditions,
    )

    # 3. Call AI provider with grounded context
    try:
        report_context = {
            "user_name": current_user.full_name or "Patient",
            "is_report_specific": is_report_specific,
            "parameters": verified_params[:15],
            "detected_conditions": detected_conditions,
            "query_intent": nlp_result.query_intent,
        }
        res = await ai_provider.chat_with_report(
            report_context=report_context,
            question=payload.question,
        )
        reply_text = (
            res.get("answer")
            or res.get("response")
            or res.get("reply")
            or "I have reviewed your verified lab metrics. Please consult your physician regarding any concerning numbers."
        )
    except Exception as exc:
        logger.warning("assistant.gemini_call_failed", error=str(exc))
        # Deterministic educational fallback
        reply_text = (
            f"Regarding your inquiry about {', '.join(nlp_result.identified_biomarkers) if nlp_result.identified_biomarkers else 'your health indicators'}: "
            f"Laboratory reference ranges reflect standard baseline distributions. "
            f"Any flags should be evaluated in context by your primary care provider. "
            f"(Note: AI insights are currently running in deterministic educational mode)."
        )

    return AssistantChatResponse(
        reply=reply_text,
        classified_intent=nlp_result.query_intent,
        referenced_biomarkers=nlp_result.identified_biomarkers,
        is_report_specific=is_report_specific,
        grounded_parameters_count=len(verified_params),
    )
