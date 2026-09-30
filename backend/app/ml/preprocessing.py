"""
HealthLens AI — ML Preprocessing Pipeline
===========================================
Handles missing value imputation, robust scaling, and clinical parameter normalization.
Stores feature scalers and population imputation baselines for offline/online inference.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler


class ClinicalDataPreprocessor:
    """
    Preprocessor designed for clinical laboratory data:
    1. Median imputation per parameter using reference population distributions.
    2. Robust scaling (resistant to extreme outliers).
    3. Physiological bounds clipping to guard against invalid artifact values.
    """

    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names
        self.medians: Dict[str, float] = {}
        self.iqr_lower: Dict[str, float] = {}
        self.iqr_upper: Dict[str, float] = {}
        self.scaler = RobustScaler(unit_variance=True)
        self.is_fitted = False

    def fit(self, df: pd.DataFrame) -> "ClinicalDataPreprocessor":
        """Fit imputation statistics and RobustScaler on population training data."""
        # Ensure all expected columns are present
        data = df[self.feature_names].copy()

        # Compute population summary statistics per feature
        for col in self.feature_names:
            series = data[col].dropna()
            if len(series) > 0:
                self.medians[col] = float(series.median())
                q25 = float(series.quantile(0.25))
                q75 = float(series.quantile(0.75))
                self.iqr_lower[col] = q25
                self.iqr_upper[col] = q75
            else:
                self.medians[col] = 0.0
                self.iqr_lower[col] = -1.0
                self.iqr_upper[col] = 1.0

        # Impute missing values with column medians for scaler fitting
        imputed_data = data.fillna(self.medians)
        self.scaler.fit(imputed_data.values)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform input dataframe into scaled feature matrix."""
        if not self.is_fitted:
            raise ValueError("ClinicalDataPreprocessor must be fitted before transforming data.")

        data = df.reindex(columns=self.feature_names).copy()
        # Fill missing with learned population medians
        imputed = data.fillna(self.medians)
        scaled = self.scaler.transform(imputed.values)
        return scaled

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        return self.fit(df).transform(df)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize preprocessor state to dictionary for JSON persistence."""
        return {
            "feature_names": self.feature_names,
            "medians": self.medians,
            "iqr_lower": self.iqr_lower,
            "iqr_upper": self.iqr_upper,
            "center_": self.scaler.center_.tolist() if hasattr(self.scaler, "center_") and self.scaler.center_ is not None else [],
            "scale_": self.scaler.scale_.tolist() if hasattr(self.scaler, "scale_") and self.scaler.scale_ is not None else [],
            "is_fitted": self.is_fitted,
        }

    @classmethod
    def from_dict(cls, state: Dict[str, Any]) -> "ClinicalDataPreprocessor":
        """Deserialize preprocessor state from dictionary."""
        instance = cls(feature_names=state["feature_names"])
        instance.medians = state.get("medians", {})
        instance.iqr_lower = state.get("iqr_lower", {})
        instance.iqr_upper = state.get("iqr_upper", {})
        instance.is_fitted = state.get("is_fitted", False)
        if state.get("center_") and state.get("scale_"):
            instance.scaler.center_ = np.array(state["center_"])
            instance.scaler.scale_ = np.array(state["scale_"])
        return instance
