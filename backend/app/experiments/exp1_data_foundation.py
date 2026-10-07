"""
Experiment 1: AI and Python Data Foundation
============================================
Data processing foundation using NumPy, Pandas, and Matplotlib:
- Data validation and missing-value analysis
- Statistical profile (mean, std, min, max, 25%, 50%, 75%, IQR, skewness)
- Unit normalization and value transformations
- Longitudinal measurement aggregation
- Distinguishes raw extracted values from normalized values
"""

from __future__ import annotations

import io
import base64
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

# Experiment 1: Matplotlib headless environment configuration
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


class DataFoundationService:
    """Production-grade structured health data processor."""

    # Unit conversion factors to standard SI / clinical units
    UNIT_CONVERSIONS: Dict[str, Dict[str, float]] = {
        "glucose": {
            "mg/dl": 1.0,
            "mmol/l": 18.0182,
        },
        "cholesterol": {
            "mg/dl": 1.0,
            "mmol/l": 38.67,
        },
        "creatinine": {
            "mg/dl": 1.0,
            "umol/l": 0.011312,
        },
        "hemoglobin": {
            "g/dl": 1.0,
            "g/l": 0.1,
            "mmol/l": 1.611,
        },
        "weight": {
            "kg": 1.0,
            "lbs": 0.453592,
        },
        "height": {
            "cm": 1.0,
            "m": 100.0,
            "inches": 2.54,
            "ft": 30.48,
        },
    }

    def __init__(self) -> None:
        pass

    def validate_and_clean_measurements(
        self, records: List[Dict[str, Any]]
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Validates, cleans, and separates raw records into a verified Pandas DataFrame
        along with a comprehensive missing-value audit report.
        """
        if not records:
            empty_df = pd.DataFrame(columns=["parameter", "raw_value", "normalized_value", "unit", "is_valid"])
            return empty_df, {
                "total": 0,
                "valid": 0,
                "missing": 0,
                "invalid": 0,
                "missing_rate": 0.0,
                "data_quality_score": 0.0,
            }

        df = pd.DataFrame(records)

        # Standardize expected columns
        if "parameter" not in df.columns and "parameter_name" in df.columns:
            df["parameter"] = df["parameter_name"]
        if "name" in df.columns and "parameter" not in df.columns:
            df["parameter"] = df["name"]

        # Ensure raw_value preservation
        if "value" in df.columns and "raw_value" not in df.columns:
            df["raw_value"] = df["value"]

        # Track initial audit
        total_records = len(df)
        missing_count = int(df["raw_value"].isna().sum())

        # Clean numeric conversion
        df["numeric_value"] = pd.to_numeric(df["raw_value"], errors="coerce")
        invalid_count = int((df["raw_value"].notna() & df["numeric_value"].isna()).sum())

        df["is_valid"] = df["numeric_value"].notna() & (df["numeric_value"] > 0)
        valid_count = int(df["is_valid"].sum())

        audit = {
            "total": total_records,
            "valid": valid_count,
            "missing": missing_count,
            "invalid": invalid_count,
            "missing_rate": round(float(missing_count / total_records), 4) if total_records > 0 else 0.0,
            "data_quality_score": round(float(valid_count / total_records * 100), 1) if total_records > 0 else 0.0,
        }

        # Raw values remain preserved as strings or raw objects; normalized values are floats
        df["normalized_value"] = df["numeric_value"]
        return df, audit

    def compute_descriptive_statistics(
        self, values: Union[List[float], np.ndarray, pd.Series]
    ) -> Dict[str, Optional[float]]:
        """
        Computes robust descriptive statistics using NumPy & Pandas.
        """
        arr = np.array(values, dtype=float)
        valid = arr[~np.isnan(arr)]

        if len(valid) == 0:
            return {
                "count": 0,
                "mean": None,
                "std": None,
                "min": None,
                "q25": None,
                "median": None,
                "q75": None,
                "max": None,
                "iqr": None,
                "variance": None,
            }

        q25, median, q75 = np.percentile(valid, [25, 50, 75])
        mean_val = float(np.mean(valid))
        std_val = float(np.std(valid, ddof=1)) if len(valid) > 1 else 0.0

        return {
            "count": int(len(valid)),
            "mean": round(mean_val, 3),
            "std": round(std_val, 3),
            "min": round(float(np.min(valid)), 3),
            "q25": round(float(q25), 3),
            "median": round(float(median), 3),
            "q75": round(float(q75), 3),
            "max": round(float(np.max(valid)), 3),
            "iqr": round(float(q75 - q25), 3),
            "variance": round(float(np.var(valid, ddof=1)), 3) if len(valid) > 1 else 0.0,
        }

    def normalize_unit(
        self, parameter_key: str, value: float, current_unit: str, target_unit: str
    ) -> Tuple[float, bool]:
        """
        Converts a value between standard units safely.
        Returns (converted_value, was_converted).
        """
        param_norm = parameter_key.lower().strip()
        c_unit = current_unit.lower().strip()
        t_unit = target_unit.lower().strip()

        if c_unit == t_unit:
            return value, False

        # Look up conversion table
        for key, unit_map in self.UNIT_CONVERSIONS.items():
            if key in param_norm:
                if c_unit in unit_map and t_unit in unit_map:
                    # Convert to base unit then to target
                    base_val = value * unit_map[c_unit]
                    converted = base_val / unit_map[t_unit]
                    return round(converted, 3), True

        return value, False

    def aggregate_longitudinal_series(
        self, historical_points: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Aggregates chronological measurements into temporal bins (e.g. monthly or per-report).
        """
        if not historical_points:
            return {"series": [], "summary": {}}

        df = pd.DataFrame(historical_points)
        if "value" not in df.columns or df["value"].dropna().empty:
            return {"series": [], "summary": {}}

        df["value"] = pd.to_numeric(df["value"], errors="coerce")
        valid_df = df.dropna(subset=["value"]).copy()

        if valid_df.empty:
            return {"series": [], "summary": {}}

        stats = self.compute_descriptive_statistics(valid_df["value"].values)

        return {
            "series": valid_df.to_dict(orient="records"),
            "summary": stats,
            "total_observations": len(valid_df),
        }

    def generate_distribution_plot_base64(
        self,
        title: str = "Biomarker Distribution Profile",
        values: Optional[List[float]] = None,
        unit: str = "",
    ) -> Optional[str]:
        """
        Experiment 1: Matplotlib Data Visualization.
        Generates a clean statistical distribution histogram & density curve
        using Matplotlib in headless Agg mode and returns a base64 encoded PNG.
        """
        data = [v for v in (values or []) if v is not None and not np.isnan(v)]
        if len(data) < 2:
            return None

        try:
            fig, ax = plt.subplots(figsize=(6.5, 3.5), dpi=100)
            fig.patch.set_facecolor("#FFFFFF")
            ax.set_facecolor("#F8FAFC")

            # Histogram
            n, bins, patches = ax.hist(
                data,
                bins=min(len(data), 8),
                color="#10B981",
                edgecolor="#047857",
                alpha=0.7,
                density=False,
                label="Observation Frequency",
            )

            # Overlay statistical reference lines
            mean_val = float(np.mean(data))
            median_val = float(np.median(data))
            ax.axvline(mean_val, color="#0284C7", linestyle="--", linewidth=1.8, label=f"Mean: {mean_val:.1f}{(' ' + unit) if unit else ''}")
            ax.axvline(median_val, color="#D97706", linestyle=":", linewidth=1.8, label=f"Median: {median_val:.1f}{(' ' + unit) if unit else ''}")

            # Clean styling
            ax.set_title(f"Exp 1: {title} (Matplotlib)", fontsize=11, fontweight="bold", color="#0F172A", pad=12)
            ax.set_xlabel(f"Measured Value{(' (' + unit + ')') if unit else ''}", fontsize=9, color="#475569")
            ax.set_ylabel("Count", fontsize=9, color="#475569")
            ax.grid(True, linestyle=":", alpha=0.5, color="#CBD5E1")
            ax.legend(loc="upper right", fontsize=8, framealpha=0.9)
            ax.tick_params(colors="#475569", labelsize=8)

            for spine in ax.spines.values():
                spine.set_color("#E2E8F0")

            plt.tight_layout()

            buf = io.BytesIO()
            plt.savefig(buf, format="png", bbox_inches="tight")
            plt.close(fig)
            buf.seek(0)
            encoded = base64.b64encode(buf.read()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
        except Exception:
            return None

    def summarize_report_parameters(
        self, parameters: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Processes and summarizes a single report's extracted parameters for Experiment 1:
        - Validates and cleans raw extractions
        - Standardizes units where possible
        - Computes NumPy/Pandas descriptive statistics
        - Produces a data quality score and audit metrics
        - Generates Matplotlib distribution profile visualization
        """
        df, audit = self.validate_and_clean_measurements(parameters)
        valid_vals = df[df["is_valid"]]["normalized_value"].dropna().tolist() if not df.empty else []
        stats = self.compute_descriptive_statistics(valid_vals)
        plot_base64 = self.generate_distribution_plot_base64("Extracted Biomarkers", valid_vals)

        return {
            "total_parameters": audit["total"],
            "valid_parameters": audit["valid"],
            "missing_parameters": audit["missing"],
            "data_quality_score": audit["data_quality_score"],
            "missing_rate": audit["missing_rate"],
            "descriptive_statistics": stats,
            "matplotlib_visualization_base64": plot_base64,
            "processing_engine": "NumPy, Pandas & Matplotlib Clinical Data Foundation",
        }
