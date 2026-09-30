"""
HealthLens AI — Isolation Forest Anomaly Detection Models
===========================================================
Trains and executes Isolation Forest models on structured population health data.
Converts raw tree isolation depth into calibrated anomaly scores and identifies
which specific health parameters drive the unusual pattern.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from app.ml.preprocessing import ClinicalDataPreprocessor


class PanelAnomalyDetector:
    """
    Anomaly detector for a specific clinical panel (e.g. Biochemistry or CBC).
    Uses Isolation Forest with robust data preprocessing and feature attribution.

    Contamination parameter: 0.06 — used by Isolation Forest as the assumed proportion
    of training observations treated as outliers. It does not imply that 6% of patients
    are medically anomalous.

    ML anomaly detection alone does NOT determine medical urgency or diagnosis. It serves
    as one evidence signal alongside reference-range findings, personal longitudinal changes,
    and deterministic analysis.
    """

    def __init__(
        self,
        panel_name: str,
        feature_names: List[str],
        contamination: float = 0.06,
        n_estimators: int = 150,
        random_state: int = 42,
    ):
        self.panel_name = panel_name
        self.feature_names = feature_names
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.random_state = random_state

        self.preprocessor = ClinicalDataPreprocessor(feature_names=feature_names)
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=-1,
        )
        self.is_fitted = False
        # Calibration thresholds derived from training distribution
        self.score_p90: float = 0.0
        self.score_p95: float = 0.0
        self.score_p99: float = 0.0
        self.score_min: float = -1.0
        self.score_max: float = 1.0

    def fit(self, feature_df: pd.DataFrame) -> "PanelAnomalyDetector":
        """
        Fit preprocessor and Isolation Forest on training feature dataframe.
        """
        X_scaled = self.preprocessor.fit_transform(feature_df)
        self.model.fit(X_scaled)

        # Calibrate score thresholds on training set
        # decision_function: lower means more anomalous
        train_scores = self.model.decision_function(X_scaled)
        self.score_min = float(np.min(train_scores))
        self.score_max = float(np.max(train_scores))

        # Quantiles of inverted score (so higher = more anomalous)
        inverted = -train_scores
        self.score_p90 = float(np.quantile(inverted, 0.90))
        self.score_p95 = float(np.quantile(inverted, 0.95))
        self.score_p99 = float(np.quantile(inverted, 0.99))

        self.is_fitted = True
        return self

    def predict_sample(
        self,
        features_dict: Dict[str, Optional[float]],
        present_parameter_names: List[str],
    ) -> Dict[str, Any]:
        """
        Evaluate a single patient report's features against the trained model.
        Returns calibrated anomaly score, anomaly level, and affected parameters.
        """
        if not self.is_fitted:
            raise RuntimeError(f"PanelAnomalyDetector [{self.panel_name}] is not fitted.")

        # Create 1-row DataFrame
        row = {f: features_dict.get(f, np.nan) for f in self.feature_names}
        df_row = pd.DataFrame([row])

        X_scaled = self.preprocessor.transform(df_row)
        raw_dec = float(self.model.decision_function(X_scaled)[0])
        is_anomaly = bool(self.model.predict(X_scaled)[0] == -1)

        # Compute calibrated score [0.0, 1.0]
        # Inverted score: positive indicates degree of isolation
        inverted_score = -raw_dec
        if self.score_p99 > self.score_min:
            norm_score = (inverted_score - (-self.score_max)) / (self.score_p99 - (-self.score_max) + 1e-6)
            calibrated_score = float(np.clip(norm_score, 0.0, 1.0))
        else:
            calibrated_score = 0.5 if is_anomaly else 0.2

        # Map to discrete level
        if calibrated_score >= 0.85 or (is_anomaly and inverted_score >= self.score_p95):
            anomaly_level = "high"
        elif calibrated_score >= 0.70 or is_anomaly:
            anomaly_level = "medium"
        elif calibrated_score >= 0.55:
            anomaly_level = "low"
        else:
            anomaly_level = "normal"

        anomaly_detected = (anomaly_level in ["medium", "high"])

        # Determine affected parameters via robust z-deviation from population medians
        # Only attribute to parameters that were actually present in the patient's report
        affected_params: List[str] = []
        param_deviations: List[Tuple[str, float]] = []

        for p in present_parameter_names:
            if p in self.preprocessor.medians and p in features_dict:
                val = features_dict.get(p)
                if val is not None and np.isfinite(val):
                    med = self.preprocessor.medians[p]
                    iqr = max(0.01, self.preprocessor.iqr_upper.get(p, med + 1.0) - self.preprocessor.iqr_lower.get(p, med - 1.0))
                    # Robust deviation metric (approx normalized z-score)
                    dev = abs(val - med) / (iqr * 0.7413) # 0.7413 * IQR approximates standard deviation
                    param_deviations.append((p, float(dev)))

        # Sort by largest deviation
        param_deviations.sort(key=lambda x: x[1], reverse=True)

        if anomaly_detected:
            # Pick parameters with noticeable deviation (e.g. dev > 1.6)
            for p, dev in param_deviations:
                if dev >= 1.6:
                    affected_params.append(p)
            # If none crossed 1.6, take top 2 highest deviations to explain pattern
            if not affected_params and param_deviations:
                affected_params = [p for p, _ in param_deviations[:2]]

        # Generate non-diagnostic explanation
        if anomaly_detected and affected_params:
            reason = (
                f"Unusual multivariable pattern observed in {self.panel_name.replace('_', ' ')}: "
                f"parameters [{', '.join(affected_params)}] deviate from patterns commonly "
                "seen in the reference population dataset."
            )
        elif anomaly_detected:
            reason = (
                f"Unusual combination of {self.panel_name.replace('_', ' ')} parameters detected "
                "relative to learned reference population distributions."
            )
        else:
            reason = f"Parameter patterns for {self.panel_name.replace('_', ' ')} are consistent with reference population baselines."

        return {
            "panel_name": self.panel_name,
            "anomaly_detected": anomaly_detected,
            "anomaly_level": anomaly_level,
            "anomaly_score": round(calibrated_score, 3),
            "affected_parameters": affected_params,
            "reason": reason,
        }
