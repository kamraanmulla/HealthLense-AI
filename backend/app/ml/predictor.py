"""
HealthLens AI — ML Anomaly Detection Predictor
================================================
Fast online inference engine that scores patient health parameters against
trained NHANES population anomaly models and tracks longitudinal patterns.

Population vs Personal Baseline Distinction:
- Population Anomaly Detection: Isolation Forest models identify unusual multivariable
  patterns relative to the cross-sectional NHANES reference population.
- Personal Longitudinal Analysis: Current-vs-previous changes are calculated strictly
  from the user's own historical reports. NHANES must NOT be treated as the user's personal baseline.

Clinical Boundary:
- ML anomaly detection alone does NOT determine medical urgency or diagnosis.
- ML is one evidence signal alongside reference-range findings, personal longitudinal
  changes, deterministic analysis, and data quality.
- Never crashes the caller: defensive error handling with safe fallbacks.
- Strictly non-clinical, informational pattern evaluation.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np

from app.core.logging import get_logger
from app.ml.feature_engineering import (
    compute_longitudinal_features,
    BIOCHEMISTRY_PRIMARY_PARAMETERS,
    CBC_PRIMARY_PARAMETERS,
)

logger = get_logger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "model_artifacts"
MODEL_PATH = ARTIFACTS_DIR / "health_anomaly_model.joblib"

_MODEL_CACHE: Optional[Dict[str, Any]] = None


def get_loaded_models() -> Optional[Dict[str, Any]]:
    """Cached loader for serialized model bundle."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    if not MODEL_PATH.exists():
        logger.warning("ml_predictor.model_not_found", path=str(MODEL_PATH))
        return None

    try:
        _MODEL_CACHE = joblib.load(MODEL_PATH)
        logger.info("ml_predictor.model_loaded_successfully", version=_MODEL_CACHE.get("version"))
        return _MODEL_CACHE
    except Exception as exc:
        logger.error("ml_predictor.model_load_failed", error=str(exc))
        return None


class HealthAnomalyPredictor:
    """
    Evaluates patient lab results against learned population distributions.
    """

    def __init__(self, model_bundle: Optional[Dict[str, Any]] = None):
        self.bundle = model_bundle or get_loaded_models()

    def is_available(self) -> bool:
        return self.bundle is not None and "models" in self.bundle

    def predict(
        self,
        parameters: List[Dict[str, Any]],
        historical_reports: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Run anomaly detection on extracted parameters.

        Args:
            parameters: List of parameter dicts, e.g.
                        [{'parameter_name': 'Hemoglobin', 'value': 14.2, ...}, ...]
                        or dictionary of {param_name: value}.
            historical_reports: Prior reports for this user to calculate longitudinal changes.

        Returns:
            Structured finding matching HealthLens specification.
        """
        fallback_response = {
            "anomaly_detected": False,
            "anomaly_level": "unavailable",
            "anomaly_score": 0.0,
            "affected_parameters": [],
            "reason": "Health pattern analysis is currently unavailable.",
            "model_version": "unavailable",
            "analysis_type": "population_anomaly_detection",
            "parameters_analyzed": [],
            "longitudinal_changes": [],
            "disclaimer": "This pattern analysis is informational and is not a medical diagnosis.",
        }

        if not self.is_available():
            logger.info("ml_predictor.models_not_available_returning_fallback")
            return fallback_response

        try:
            # 1. Parse and extract current parameters map
            param_map: Dict[str, float] = {}
            if isinstance(parameters, list):
                for p in parameters:
                    name = p.get("parameter_name") or p.get("name")
                    val = p.get("value")
                    if name and val is not None:
                        try:
                            fval = float(val)
                            if np.isfinite(fval):
                                param_map[name] = fval
                        except (ValueError, TypeError):
                            continue
            elif isinstance(parameters, dict):
                for k, v in parameters.items():
                    if v is not None:
                        try:
                            fval = float(v)
                            if np.isfinite(fval):
                                param_map[k] = fval
                        except (ValueError, TypeError):
                            continue

            if not param_map:
                logger.info("ml_predictor.no_supported_parameters_to_score")
                fallback_response["reason"] = "No quantitative health parameters were available for pattern analysis."
                fallback_response["anomaly_level"] = "normal"
                return fallback_response

            # 2. Derive engineered numerical features:
            # 19 primary laboratory values + 5 derived numerical features = 24 model features (Biochemistry)
            # 9 primary CBC parameters + 2 derived numerical features = 11 model features (Hematology)
            features_dict: Dict[str, Optional[float]] = dict(param_map)

            # Biochemistry derived numerical features (5)
            if "Creatinine" in param_map and "Urea" in param_map and param_map["Creatinine"] > 0:
                features_dict["BUN_Creatinine_ratio"] = param_map["Urea"] / param_map["Creatinine"]
            if "SGOT" in param_map and "SGPT" in param_map and param_map["SGPT"] > 0:
                features_dict["AST_ALT_ratio"] = param_map["SGOT"] / param_map["SGPT"]
            if "Albumin" in param_map and "Total Protein" in param_map:
                globulin = max(0.1, param_map["Total Protein"] - param_map["Albumin"])
                features_dict["AG_ratio"] = param_map["Albumin"] / globulin
            if "Sodium" in param_map and "Potassium" in param_map and param_map["Potassium"] > 0:
                features_dict["Na_K_ratio"] = param_map["Sodium"] / param_map["Potassium"]
            if "Triglycerides" in param_map and "Total Cholesterol" in param_map and param_map["Total Cholesterol"] > 0:
                features_dict["Trig_Chol_ratio"] = param_map["Triglycerides"] / param_map["Total Cholesterol"]

            # Hematology derived numerical features (2)
            if "MCH" in param_map and "MCV" in param_map and param_map["MCV"] > 0:
                features_dict["MCH_MCV_ratio"] = param_map["MCH"] / param_map["MCV"]
            if "Platelets" in param_map and "WBC" in param_map and param_map["WBC"] > 0:
                features_dict["PLT_WBC_ratio"] = param_map["Platelets"] / param_map["WBC"]

            # 3. Evaluate panels
            models = self.bundle["models"]
            panel_results: Dict[str, Any] = {}
            all_affected: List[str] = []
            max_score: float = 0.0
            analyzed_params: List[str] = []

            # A. Biochemistry Panel
            bio_model = models.get("biochemistry_metabolic")
            bio_present = [p for p in BIOCHEMISTRY_PRIMARY_PARAMETERS if p in param_map]
            if bio_model and bio_present:
                bio_eval = bio_model.predict_sample(features_dict, bio_present)
                panel_results["biochemistry_metabolic"] = bio_eval
                max_score = max(max_score, bio_eval["anomaly_score"])
                all_affected.extend(bio_eval.get("affected_parameters", []))
                analyzed_params.extend(bio_present)

            # B. Hematology CBC Panel
            cbc_model = models.get("hematology_cbc")
            cbc_present = [p for p in CBC_PRIMARY_PARAMETERS if p in param_map]
            if cbc_model and cbc_present:
                cbc_eval = cbc_model.predict_sample(features_dict, cbc_present)
                panel_results["hematology_cbc"] = cbc_eval
                max_score = max(max_score, cbc_eval["anomaly_score"])
                all_affected.extend(cbc_eval.get("affected_parameters", []))
                analyzed_params.extend(cbc_present)

            # Deduplicate affected parameters maintaining order
            dedup_affected: List[str] = []
            for p in all_affected:
                if p not in dedup_affected:
                    dedup_affected.append(p)

            # 4. Synthesize overall anomaly level
            if max_score >= 0.85:
                overall_level = "high"
                anomaly_detected = True
            elif max_score >= 0.70:
                overall_level = "medium"
                anomaly_detected = True
            elif max_score >= 0.55:
                overall_level = "low"
                anomaly_detected = False
            else:
                overall_level = "normal"
                anomaly_detected = False

            # If anomaly detected, ensure non-alarming reason
            if anomaly_detected and dedup_affected:
                reason = (
                    f"Unusual multivariable pattern observed: parameter combinations for "
                    f"[{', '.join(dedup_affected)}] differ from patterns commonly observed "
                    "in the reference population dataset."
                )
            elif anomaly_detected:
                reason = "Some parameter combinations show atypical distribution relative to the learned reference population."
            else:
                reason = "Reported parameter patterns are consistent with learned reference population distributions."

            # 5. Calculate patient longitudinal features
            longitudinal_summary = []
            if historical_reports:
                longitudinal_data = compute_longitudinal_features(param_map, historical_reports)
                for p_name, l_info in longitudinal_data.items():
                    if l_info.get("previous_value") is not None:
                        longitudinal_summary.append({
                            "parameter": p_name,
                            "current_value": l_info["current_value"],
                            "previous_value": l_info["previous_value"],
                            "absolute_change": l_info["absolute_change"],
                            "percentage_change": l_info["percentage_change"],
                            "direction": l_info["direction"],
                            "number_of_previous_reports": l_info["number_of_previous_reports"],
                        })

            return {
                "anomaly_detected": anomaly_detected,
                "anomaly_level": overall_level,
                "anomaly_score": round(max_score, 3),
                "affected_parameters": dedup_affected,
                "reason": reason,
                "model_version": self.bundle.get("version", "1.0.0"),
                "analysis_type": "population_anomaly_detection",
                "parameters_analyzed": analyzed_params,
                "panel_breakdown": panel_results,
                "longitudinal_changes": longitudinal_summary,
                "disclaimer": "This pattern analysis is informational and is not a medical diagnosis.",
            }

        except Exception as exc:
            logger.exception("ml_predictor.predict_failed_with_safe_fallback", error=str(exc))
            return fallback_response


# Global singleton instance
_DEFAULT_PREDICTOR: Optional[HealthAnomalyPredictor] = None


def get_anomaly_predictor() -> HealthAnomalyPredictor:
    """Get or instantiate the global anomaly detector."""
    global _DEFAULT_PREDICTOR
    if _DEFAULT_PREDICTOR is None:
        _DEFAULT_PREDICTOR = HealthAnomalyPredictor()
    return _DEFAULT_PREDICTOR
