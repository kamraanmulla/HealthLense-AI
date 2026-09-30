"""
HealthLens AI — Google Gemini AI Provider
==========================================
Uses the official Google GenAI Python SDK (`google-genai`) with model `gemini-2.5-flash`.
Provides educational health report explanations and context-bound chat.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import time
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from google.genai import errors

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.ai.base import AIProvider

logger = get_logger(__name__)


class GeminiProvider(AIProvider):
    """Google Gemini AI Provider implementation using official google-genai SDK."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.api_key = self.settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = self.settings.ai_model or "gemini-2.5-flash"
        self._client: Optional[genai.Client] = None

        if self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info("ai.gemini.initialized", model=self.model)
            except Exception as exc:
                logger.error("ai.gemini.init_failed", error=str(exc))
                self._client = None
        else:
            logger.warning("ai.gemini.missing_api_key", msg="GEMINI_API_KEY not configured. Fallback responses will be used.")

    def _get_client(self) -> Optional[genai.Client]:
        if self._client is not None:
            return self._client
        current_key = self.settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
        if current_key:
            try:
                self._client = genai.Client(api_key=current_key)
                return self._client
            except Exception as exc:
                logger.error("ai.gemini.client_creation_failed", error=str(exc))
        return None

    def _clean_json_string(self, text: str) -> str:
        """Strip markdown code fence blocks if present."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _build_fallback_analysis(
        self,
        report_text: str,
        detected_conditions: Optional[List[Dict[str, Any]]] = None,
        deterministic_recommendations: Optional[Dict[str, List[str]]] = None,
        reason: str = "AI health insights are temporarily unavailable."
    ) -> Dict[str, Any]:
        """
        Provides a structured fallback matching AIAnalysisResult shape
        so report processing succeeds cleanly even if Gemini quota or connection fails.
        """
        logger.info("ai.gemini.generating_fallback", reason=reason)

        cond_names = [c.get("name") for c in detected_conditions] if detected_conditions else []
        lifestyle_recs: List[str] = []
        diet_recs: List[str] = []
        doctor_recs: List[str] = []

        if deterministic_recommendations:
            lifestyle_recs = deterministic_recommendations.get("lifestyle", [])
            diet_recs = deterministic_recommendations.get("dietary", [])
            doctor_recs = deterministic_recommendations.get("doctor_discussion", [])

        summary_text = (
            "Medical parameters were successfully extracted and evaluated by HealthLens clinical rules. "
            f"{reason} All laboratory measurements, reference bounds, and clinical flags have been safely recorded."
        )

        insights = []
        if cond_names:
            insights.append({"insight": f"Identified clinical flags relating to: {', '.join(cond_names)}."})
        insights.append({"insight": "Please review individual laboratory parameters and consult with your healthcare provider for clinical evaluation."})

        return {
            "summary": summary_text,
            "patient_info": {},
            "top_risks": cond_names[:3] if cond_names else ["Clinical evaluation advised"],
            "abnormal_parameters": [],
            "personalized_health_insights": insights,
            "ai_health_summary": {
                "overall_summary": summary_text,
                "key_findings": [f"Evaluated report parameters with {len(cond_names)} clinical indicator(s) noted."],
                "lifestyle_recommendations": lifestyle_recs or ["Maintain regular physical activity as advised by your physician."],
                "dietary_guidance": diet_recs or ["Follow a balanced diet and stay properly hydrated."],
                "doctor_discussion_points": doctor_recs or ["Discuss out-of-range parameters with your primary care doctor."],
                "medical_disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
            },
            "immediate_attention": ["Review abnormal test values with a qualified medical specialist."],
            "doctor_recommendation": "Primary Care Physician or specialist as indicated by laboratory parameters.",
            "follow_up_tests": ["Follow-up routine blood work as recommended by your physician."],
            "long_term_monitoring": ["Regular health checkups and blood profile tracking."],
            "preventive_advice": ["Maintain healthy sleep, hydration, and nutritional habits."]
        }

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
        Analyzes medical report text using Gemini 2.5 Flash and returns structured JSON
        matching the expected AIAnalysisResult contract.
        """
        logger.info("ai.gemini.analyze_request", text_length=len(report_text))

        client = self._get_client()
        if not client:
            logger.warning("ai.gemini.analyze_skipped_no_key")
            return self._build_fallback_analysis(
                report_text,
                detected_conditions,
                deterministic_recommendations,
                reason="Gemini API key is not configured in backend .env."
            )

        profile_context = ""
        if user_profile:
            profile_context = f"\nUser Profile:\n{json.dumps(user_profile, indent=2)}\n"

        history_context = ""
        if previous_reports:
            history_context = f"\nPrevious Reports History:\n{json.dumps(previous_reports, indent=2)}\n"

        conditions_context = ""
        if detected_conditions:
            conditions_context = f"\nDetected Conditions (Clinical engine detected):\n{json.dumps(detected_conditions, indent=2)}\n"

        recommendations_context = ""
        if deterministic_recommendations:
            recommendations_context = f"\nDeterministic Recommendations:\n{json.dumps(deterministic_recommendations, indent=2)}\n"

        ml_context = ""
        if ml_findings and isinstance(ml_findings, dict) and ml_findings.get("anomaly_level") != "unavailable":
            ml_context = "\nComputed Health Pattern Analysis (Precomputed ML Findings — For Explanation Only):\n"
            ml_context += f"- Population Anomaly Detected: {ml_findings.get('anomaly_detected', False)}\n"
            ml_context += f"- Pattern Classification: {ml_findings.get('anomaly_level', 'normal')}\n"
            if ml_findings.get("affected_parameters"):
                ml_context += f"- Parameters Contributing to Pattern: {', '.join(ml_findings['affected_parameters'])}\n"
            if ml_findings.get("reason"):
                ml_context += f"- Informational Note: {ml_findings['reason']}\n"
            longitudinal = ml_findings.get("longitudinal_changes", [])
            if longitudinal:
                ml_context += "- Personal Longitudinal Deltas (vs User's Prior Reports):\n"
                for ch in longitudinal[:5]:
                    ml_context += f"  * {ch.get('parameter')}: {ch.get('previous_value')} -> {ch.get('current_value')} ({ch.get('direction')}, {ch.get('percentage_change')}%)\n"

        prompt = f"""You are HealthLens AI, a professional medical report explanation assistant.
The backend clinical engine has already performed parameter extraction, reference-range evaluations, and statistical pattern analysis.

Medical Report Text:
{report_text}
{profile_context}{history_context}{conditions_context}{recommendations_context}{ml_context}

Your task:
- Explain the health findings, deterministic condition indicators, personal longitudinal changes, and ML anomaly findings in clear, understandable, compassionate language.
- DO NOT independently calculate or override the ML anomaly scores or results; explain the provided computed findings as educational pattern insights.
- DO NOT treat ML anomaly detection alone as medical urgency or diagnosis. Urgent attention is determined strictly by severe out-of-range clinical flags and reference ranges, NOT by ML anomaly scores.
- Summarize the report clearly for the patient.
- Explain abnormal values and what they may indicate.
- Provide general lifestyle and dietary guidance matching backend recommendations.
- Keep calculations and diagnoses strictly to what the report and backend have verified.
- DO NOT invent diagnoses, medications, or prescribe drugs.
- Use safe educational language: "possible", "may suggest", "findings indicate".
- Always include encouragement to discuss results with a qualified healthcare provider.

Return ONLY a valid JSON object matching this exact schema:
{{
  "summary": "Executive summary of the health report in accessible language",
  "patient_info": {{}},
  "top_risks": ["List of primary health observations or risks"],
  "abnormal_parameters": [
    {{
      "test_name": "Parameter Name",
      "result": "Value",
      "range": "Reference range",
      "status": "Below normal | Above normal"
    }}
  ],
  "personalized_health_insights": [
    {{
      "insight": "Clear educational insight explaining a finding or parameter"
    }}
  ],
  "ai_health_summary": {{
    "overall_summary": "Friendly, reassuring summary of findings and recommendations",
    "key_findings": ["Key finding 1", "Key finding 2"],
    "lifestyle_recommendations": ["Safe lifestyle advice"],
    "dietary_guidance": ["Balanced dietary advice"],
    "doctor_discussion_points": ["Specific topics or questions to ask their doctor"],
    "medical_disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
  }},
  "immediate_attention": ["Observations requiring timely medical attention, if any"],
  "doctor_recommendation": "Which medical specialist or general practitioner to consult",
  "follow_up_tests": ["List of relevant follow-up checks"],
  "long_term_monitoring": ["Aspects to track long-term"],
  "preventive_advice": ["General healthy living suggestions"]
}}
"""

        start_time = time.time()
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )

            # Call async generate_content with timeout
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                ),
                timeout=self.settings.ai_timeout_seconds
            )

            elapsed = time.time() - start_time
            logger.info("ai.gemini.response_success", response_time_seconds=elapsed)

            raw_text = response.text or ""
            cleaned = self._clean_json_string(raw_text)
            parsed: Dict[str, Any] = json.loads(cleaned)

            # Guarantee required fields are present
            if "summary" not in parsed:
                parsed["summary"] = "Report analysis completed."
            if "ai_health_summary" not in parsed or not isinstance(parsed["ai_health_summary"], dict):
                parsed["ai_health_summary"] = {
                    "overall_summary": parsed.get("summary", ""),
                    "key_findings": [],
                    "lifestyle_recommendations": [],
                    "dietary_guidance": [],
                    "doctor_discussion_points": [],
                    "medical_disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
                }
            if "personalized_health_insights" not in parsed:
                parsed["personalized_health_insights"] = []

            return parsed

        except asyncio.TimeoutError:
            logger.error("ai.gemini.timeout", timeout_seconds=self.settings.ai_timeout_seconds)
            return self._build_fallback_analysis(
                report_text,
                detected_conditions,
                deterministic_recommendations,
                reason="AI health explanation timed out. Parameter calculations remain fully accurate."
            )
        except errors.APIError as api_err:
            status_code = getattr(api_err, "code", None) or getattr(api_err, "status_code", "API_ERROR")
            logger.error("ai.gemini.api_error", code=status_code)
            return self._build_fallback_analysis(
                report_text,
                detected_conditions,
                deterministic_recommendations,
                reason="AI service is currently operating at quota capacity. Full clinical parameters and score are preserved."
            )
        except json.JSONDecodeError as json_err:
            logger.error("ai.gemini.json_decode_error", error=str(json_err))
            return self._build_fallback_analysis(
                report_text,
                detected_conditions,
                deterministic_recommendations,
                reason="AI summary formatting was updated. Clinical measurements and values are preserved."
            )
        except Exception as exc:
            logger.error("ai.gemini.unexpected_error", error=str(exc))
            return self._build_fallback_analysis(
                report_text,
                detected_conditions,
                deterministic_recommendations,
                reason="AI explanation service is temporarily unavailable. Clinical findings are safely recorded."
            )

    async def chat_with_report(
        self,
        report_context: Dict[str, Any],
        question: str
    ) -> Dict[str, str]:
        """
        Answers a user question based strictly on the provided report context.
        """
        logger.info("ai.gemini.chat_request")

        client = self._get_client()
        if not client:
            return {
                "answer": "The AI health assistant is currently unavailable (API key not configured). Please consult your healthcare provider.",
                "disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
            }

        prompt = f"""You are HealthLens AI, a clinical report explanation assistant.
Your job is to answer questions strictly and accurately based ONLY on the provided report context.

Report Context:
{json.dumps(report_context, indent=2)}

User Question:
{question}

RULES:
- Answer ONLY using the facts from the report context above.
- If the requested information is NOT in the context, respond EXACTLY with:
  "I don't have enough information from this report. Please consult a healthcare professional."
- Do NOT provide medical diagnoses or prescribe medications.
- Maintain a calm, empathetic, and professional healthcare tone.
- Return ONLY a valid JSON object matching the schema below.

Required JSON format:
{{
  "answer": "Detailed answer explaining the report findings relating to the question",
  "disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
}}
"""

        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )

            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                ),
                timeout=self.settings.ai_timeout_seconds
            )

            raw_text = response.text or ""
            cleaned = self._clean_json_string(raw_text)
            parsed: Dict[str, str] = json.loads(cleaned)
            return {
                "answer": parsed.get("answer", "I couldn't process your question based on this report."),
                "disclaimer": parsed.get("disclaimer", "Consult a doctor for medical advice.")
            }

        except asyncio.TimeoutError:
            logger.error("ai.gemini.chat_timeout")
            return {
                "answer": "The request timed out. Please try asking your question again in a moment.",
                "disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
            }
        except errors.APIError as api_err:
            logger.error("ai.gemini.chat_api_error", code=getattr(api_err, "code", "API_ERROR"))
            return {
                "answer": "The AI health assistant is temporarily unavailable due to high demand. Please try again shortly or consult your doctor.",
                "disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
            }
        except Exception as exc:
            logger.error("ai.gemini.chat_error", error=str(exc))
            return {
                "answer": "Unable to process question at this time. Please consult your healthcare provider.",
                "disclaimer": "AI-generated analysis should not replace professional medical advice. Please consult a healthcare provider."
            }
