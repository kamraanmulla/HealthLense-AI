"""
HealthLens AI — Report Service
================================
Coordinates the background processing of a medical report.
Ties together OCR, Health Engine, and AI generation.
"""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.models.report import Report, ReportParameter
from app.models.user import UserProfile
from app.schemas.report import AIAnalysisResult, ScoreExplanation
from app.services.ai.ai_service import get_ai_provider
from app.services.health.disease_detector import detect_conditions
from app.services.health.parameter_extractor import extract_parameters
from app.services.health.recommendation_engine import generate_recommendations
from app.services.health.score_calculator import calculate_health_score
from app.services.health.validator import validate_parameters
from app.services.ocr.pipeline import extract_report_text
from app.ml.predictor import get_anomaly_predictor

logger = get_logger(__name__)

# In-memory progress tracking for real-time frontend feedback
_REPORT_PROGRESS: Dict[str, Dict[str, Any]] = {}


def get_report_progress(report_id: str) -> Dict[str, Any]:
    """Retrieve real-time processing progress and stage description."""
    return _REPORT_PROGRESS.get(
        report_id,
        {"progress": 20, "stage": "Initializing analysis..."}
    )


def _set_progress(report_id: str, progress: int, stage: str) -> None:
    """Update in-memory progress for a given report."""
    _REPORT_PROGRESS[report_id] = {"progress": progress, "stage": stage}


def _safe_parse_reference_range(ref_str: Optional[str]) -> tuple[Optional[float], Optional[float]]:
    """Safely extract min and max bounds from any reference range string."""
    if not ref_str:
        return None, None
    for delimiter in ["–", "-", "to"]:
        if delimiter in ref_str:
            parts = ref_str.split(delimiter, 1)
            try:
                min_match = re.search(r"[-+]?\d*\.?\d+", parts[0])
                max_match = re.search(r"[-+]?\d*\.?\d+", parts[1])
                min_val = float(min_match.group(0)) if min_match else None
                max_val = float(max_match.group(0)) if max_match else None
                return min_val, max_val
            except Exception:
                pass
    return None, None


async def process_report_background(report_id: str) -> None:
    """
    Main background task for processing an uploaded medical report.

    Pipeline:
    1. Status -> 'processing' (0-15%)
    2. OCR / text extraction (15-35%)
    3. Medical parameter extraction & validation (35-55%)
    4. Deterministic score calculation & disease detection (55-70%)
    5. Context retrieval & AI explanation (70-85%)
    6. Database persistence (85-95%)
    7. Completion (95-100%)
    """
    logger.info("report_service.processing_started", report_id=report_id)
    _set_progress(report_id, 10, "Initializing document pipeline...")

    db: Session = SessionLocal()
    try:
        # 1. Fetch report and update status
        report: Report | None = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            logger.error("report_service.report_not_found", report_id=report_id)
            return

        report.status = "processing"
        report.error_message = None
        db.commit()

        # 2. OCR / Document Extraction (15-35%)
        _set_progress(report_id, 25, "Extracting text and tables from document...")
        logger.info("report_service.running_ocr", report_id=report_id)
        raw_text = await asyncio.to_thread(extract_report_text, report.file_path, report.file_type)

        if not raw_text or not raw_text.strip():
            raise ValueError(
                "Document text extraction produced empty content. "
                "The file may be blank, corrupted, or an unsupported image scan."
            )

        report.raw_ocr_text = raw_text
        db.commit()

        # 3. Medical Parameter Extraction & Validation (35-55%)
        _set_progress(report_id, 45, "Extracting clinical parameters and reference ranges...")
        logger.info("report_service.extracting_parameters", report_id=report_id)
        raw_parameters = extract_parameters(raw_text)
        validated_parameters = validate_parameters(raw_parameters)

        if not validated_parameters:
            raise ValueError(
                "No medical parameters could be extracted from this report. "
                "Please verify that the document is a standard medical blood test or lab report."
            )

        # 4. Deterministic Health Score & Disease Detection (55-70%)
        _set_progress(report_id, 65, "Calculating clinical health score and evaluating indicators...")
        logger.info("report_service.calculating_score", report_id=report_id)
        health_score, risk_level, health_grade, confidence_pct, explanations = calculate_health_score(validated_parameters)

        report.health_score = health_score
        report.risk_level = risk_level
        report.health_grade = health_grade
        report.confidence_pct = confidence_pct
        db.commit()

        # Disease Detection & Deterministic Recommendations
        logger.info("report_service.detecting_conditions", report_id=report_id)
        detected_conditions = detect_conditions(validated_parameters)

        logger.info("report_service.generating_recommendations", report_id=report_id)
        deterministic_recommendations = generate_recommendations(detected_conditions)

        # 5. Context Retrieval (Profile & History)
        logger.info("report_service.fetching_context", report_id=report_id)
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == report.user_id).first()
        profile_dict = None
        if user_profile:
            profile_dict = {
                "age": user_profile.age,
                "gender": user_profile.gender,
                "height_cm": user_profile.height,
                "weight_kg": user_profile.weight,
                "bmi": user_profile.bmi,
                "medical_conditions": user_profile.medical_conditions,
                "allergies": user_profile.allergies,
                "medications": user_profile.medications,
                "activity_level": user_profile.activity_level,
                "smoking_status": user_profile.smoking_status,
                "dietary_preference": user_profile.dietary_preference,
                "sleep_information": user_profile.sleep_information,
            }
            profile_dict = {k: v for k, v in profile_dict.items() if v is not None}

        previous_reports = (
            db.query(Report)
            .filter(Report.user_id == report.user_id, Report.status == "completed", Report.id != report.id)
            .order_by(Report.created_at.desc())
            .limit(2)
            .all()
        )

        history_list = []
        for pr in previous_reports:
            if pr.ai_result and isinstance(pr.ai_result, dict):
                history_list.append({
                    "date": pr.created_at.isoformat(),
                    "health_score": pr.health_score,
                    "abnormal_parameters": pr.ai_result.get("abnormal_parameters", [])
                })

        # 5b. ML Anomaly Detection (Layer B) ─────────────────────────────────
        _set_progress(report_id, 72, "Running health pattern analysis...")
        ml_anomaly_result: Optional[Dict[str, Any]] = None
        try:
            predictor = get_anomaly_predictor()
            if predictor.is_available():
                # Build historical parameter maps for longitudinal analysis
                historical_param_reports = []
                for pr in previous_reports:
                    pr_params = {p.name: p.value for p in pr.parameters if p.value is not None}
                    if pr_params:
                        historical_param_reports.append({"parameters": pr_params})

                ml_anomaly_result = predictor.predict(
                    parameters=validated_parameters,
                    historical_reports=historical_param_reports if historical_param_reports else None,
                )
                logger.info(
                    "report_service.ml_anomaly_detection_completed",
                    report_id=report_id,
                    anomaly_detected=ml_anomaly_result.get("anomaly_detected"),
                    anomaly_level=ml_anomaly_result.get("anomaly_level"),
                )
            else:
                logger.info("report_service.ml_model_not_available", report_id=report_id)
        except Exception as ml_exc:
            logger.warning(
                "report_service.ml_anomaly_detection_failed",
                report_id=report_id,
                error=str(ml_exc),
            )
            ml_anomaly_result = None

        # 6. AI Explanation / Analysis (75-85%)
        _set_progress(report_id, 80, "Generating clinical interpretation and personalized insights...")
        logger.info("report_service.running_ai", report_id=report_id)
        ai_provider = get_ai_provider()
        ai_result: Optional[Dict[str, Any]] = None

        try:
            ai_result = await ai_provider.analyze_report(
                report_text=raw_text,
                user_profile=profile_dict,
                previous_reports=history_list if history_list else None,
                detected_conditions=[c.model_dump() for c in detected_conditions] if detected_conditions else None,
                deterministic_recommendations=deterministic_recommendations,
                ml_findings=ml_anomaly_result,
            )
        except Exception as ai_exc:
            logger.warning(
                "report_service.ai_explanation_failed_falling_back",
                report_id=report_id,
                error=str(ai_exc)
            )
            ai_result = None

        # Graceful degradation: If Gemini is unavailable, rate-limited, or failed, build deterministic fallback
        if not ai_result or not isinstance(ai_result, dict):
            logger.info("report_service.applying_deterministic_fallback", report_id=report_id)
            ai_result = ai_provider._build_fallback_analysis(
                report_text=raw_text,
                detected_conditions=[c.model_dump() for c in detected_conditions] if detected_conditions else None,
                deterministic_recommendations=deterministic_recommendations,
                reason="AI health insights are temporarily unavailable. Full clinical measurements and scores have been accurately computed."
            )

        # Ensure abnormal parameters list is populated from verified parameters if AI omitted it
        if not ai_result.get("abnormal_parameters"):
            ai_result["abnormal_parameters"] = [
                {
                    "test_name": p.get("parameter_name", "Parameter"),
                    "result": p.get("value"),
                    "range": p.get("reference_range", "N/A"),
                    "status": "Above normal" if p.get("status") == "high" else "Below normal" if p.get("status") == "low" else "Abnormal"
                }
                for p in validated_parameters if p.get("status") != "normal"
            ]

        # 7. Serialize models safely into JSON-compliant structures (85-95%)
        _set_progress(report_id, 90, "Safely recording clinical results...")
        logger.info("report_service.saving_results", report_id=report_id)

        # Convert ScoreExplanation and Condition Pydantic objects to dicts so SQLAlchemy JSON serialization never fails
        serialized_explanations = [
            e.model_dump() if hasattr(e, "model_dump") else e.dict() if hasattr(e, "dict") else e
            for e in explanations
        ]
        serialized_conditions = [
            c.model_dump() if hasattr(c, "model_dump") else c.dict() if hasattr(c, "dict") else c
            for c in detected_conditions
        ]

        ai_result["health_score"] = health_score
        ai_result["risk_level"] = risk_level
        ai_result["health_grade"] = health_grade
        ai_result["confidence_pct"] = confidence_pct
        ai_result["score_explanation"] = serialized_explanations
        ai_result["detected_conditions"] = serialized_conditions

        # Inject ML anomaly detection result into AI result blob
        if ml_anomaly_result and isinstance(ml_anomaly_result, dict):
            ai_result["ml_anomaly_detection"] = ml_anomaly_result
        else:
            ai_result["ml_anomaly_detection"] = {
                "anomaly_detected": False,
                "anomaly_level": "unavailable",
                "anomaly_score": None,
                "affected_parameters": [],
                "reason": "Health pattern analysis was not available for this report.",
                "model_version": "unavailable",
                "analysis_type": "population_anomaly_detection",
                "parameters_analyzed": [],
                "longitudinal_changes": [],
                "disclaimer": "This pattern analysis is informational and is not a medical diagnosis.",
            }

        # Validate with AIAnalysisResult schema and dump pure primitives
        try:
            validated_ai = AIAnalysisResult.model_validate(ai_result)
            clean_ai_result = validated_ai.model_dump()
        except Exception as val_err:
            logger.warning("report_service.pydantic_validation_warning", error=str(val_err))
            clean_ai_result = json.loads(json.dumps(ai_result, default=str))

        report.ai_result = clean_ai_result
        report.status = "completed"
        report.error_message = None

        # Clean any preexisting parameters for this report in case of re-processing
        db.query(ReportParameter).filter(ReportParameter.report_id == report.id).delete()

        # Save extracted parameters into child table with safe reference parsing
        for param_dict in validated_parameters:
            ref_str = param_dict.get("reference_range")
            ref_min, ref_max = _safe_parse_reference_range(ref_str)

            rp = ReportParameter(
                report_id=report.id,
                name=param_dict["parameter_name"],
                value=param_dict["value"],
                unit=param_dict.get("unit"),
                reference_min=ref_min,
                reference_max=ref_max,
                reference_text=ref_str,
                status=param_dict.get("status", "normal"),
                confidence_score=param_dict.get("confidence_score")
            )
            db.add(rp)

        db.commit()
        _set_progress(report_id, 100, "Processing completed successfully.")
        logger.info("report_service.processing_completed", report_id=report_id)

    except Exception as exc:
        logger.exception("report_service.processing_failed", report_id=report_id, error=str(exc))
        db.rollback()

        current_progress = _REPORT_PROGRESS.get(report_id, {}).get("progress", 50)
        _set_progress(report_id, current_progress, f"Error: {str(exc)}")

        # Attempt to mark the report as failed
        try:
            report_fail: Report | None = db.query(Report).filter(Report.id == report_id).first()
            if report_fail:
                report_fail.status = "failed"
                report_fail.error_message = str(exc)
                db.commit()
        except Exception as fail_db_exc:
            logger.error("report_service.failed_status_save_error", error=str(fail_db_exc))

    finally:
        db.close()
