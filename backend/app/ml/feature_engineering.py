"""
HealthLens AI — Feature Engineering Pipeline
==============================================
Constructs structured feature matrices for population anomaly detection:
- 19 primary laboratory values + 5 derived numerical features = 24 model features (Biochemistry/Metabolic)
- 9 primary CBC parameters + 2 derived numerical features = 11 model features (Hematology/CBC)

Population anomaly detection:
Isolation Forest identifies unusual multivariable patterns relative to the NHANES reference population.

Personal longitudinal analysis:
Current-vs-previous changes are calculated from the user's own historical reports.
NHANES must NOT be treated as the user's personal baseline.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd


# ── Canonical Panel Feature Lists ──────────────────────────────────────────

CBC_PRIMARY_PARAMETERS = [
    "Hemoglobin",
    "RBC",
    "WBC",
    "Platelets",
    "MCV",
    "MCH",
    "MCHC",
    "RDW",
    "Hematocrit",
]

BIOCHEMISTRY_PRIMARY_PARAMETERS = [
    "Creatinine",
    "Urea",
    "Albumin",
    "Total Protein",
    "SGOT",
    "SGPT",
    "ALP",
    "Sodium",
    "Potassium",
    "Calcium",
    "Glucose (Fasting)",
    "HbA1c",
    "Bilirubin (Total)",
    "Uric Acid",
    "Total Cholesterol",
    "Triglycerides",
    "Iron",
    "Vitamin D",
    "Ferritin",
]


def compute_cbc_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate CBC feature matrix:
    9 primary CBC parameters + 2 derived numerical features = 11 model features.
    """
    res = pd.DataFrame(index=df.index)

    # 1. 9 primary CBC parameters
    for p in CBC_PRIMARY_PARAMETERS:
        res[p] = df[p] if p in df.columns else np.nan

    # 2. 2 derived numerical features
    # MCH / MCV ratio
    mch = res["MCH"]
    mcv = res["MCV"].replace(0, np.nan)
    res["MCH_MCV_ratio"] = mch / mcv

    # Platelet to WBC ratio
    plt = res["Platelets"]
    wbc = res["WBC"].replace(0, np.nan)
    res["PLT_WBC_ratio"] = plt / wbc

    return res


def compute_biochemistry_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate Biochemistry & Metabolic feature matrix:
    19 primary laboratory values + 5 derived numerical features = 24 model features.
    """
    res = pd.DataFrame(index=df.index)

    # 1. 19 primary laboratory values
    for p in BIOCHEMISTRY_PRIMARY_PARAMETERS:
        res[p] = df[p] if p in df.columns else np.nan

    # 2. 5 derived numerical features
    # BUN / Creatinine ratio (Urea is BUN)
    urea = res["Urea"]
    creat = res["Creatinine"].replace(0, np.nan)
    res["BUN_Creatinine_ratio"] = urea / creat

    # De Ritis Ratio: AST (SGOT) / ALT (SGPT)
    ast = res["SGOT"]
    alt = res["SGPT"].replace(0, np.nan)
    res["AST_ALT_ratio"] = ast / alt

    # Albumin / Globulin ratio: Albumin / (Total Protein - Albumin)
    alb = res["Albumin"]
    tp = res["Total Protein"]
    globulin = (tp - alb).clip(lower=0.1)
    res["AG_ratio"] = alb / globulin

    # Electrolyte ratio: Sodium / Potassium
    na = res["Sodium"]
    k = res["Potassium"].replace(0, np.nan)
    res["Na_K_ratio"] = na / k

    # Lipid ratio: Triglycerides / Total Cholesterol
    trig = res["Triglycerides"]
    chol = res["Total Cholesterol"].replace(0, np.nan)
    res["Trig_Chol_ratio"] = trig / chol

    return res


# ── Patient Longitudinal Feature Calculation ───────────────────────────────

def compute_longitudinal_features(
    current_parameters: Dict[str, float],
    historical_reports: List[Dict[str, Any]],
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate patient-specific longitudinal changes without conflating with population models.

    Parameters:
    - current_parameters: Dict of parameter name -> float value from the current report.
    - historical_reports: Ordered list of prior reports (oldest to newest or newest first),
      each containing 'parameters' dict or 'date' and parameter measurements.

    Returns:
    - Dict mapping parameter_name -> {
        "current_value": float,
        "previous_value": Optional[float],
        "absolute_change": Optional[float],
        "percentage_change": Optional[float],
        "direction": Optional[str], # "increased", "decreased", "stable"
        "historical_mean": Optional[float],
        "historical_std": Optional[float],
        "number_of_previous_reports": int,
      }
    """
    results: Dict[str, Dict[str, Any]] = {}

    for param_name, curr_val in current_parameters.items():
        if curr_val is None or not np.isfinite(curr_val):
            continue

        # Gather historical values for this specific parameter
        past_values: List[float] = []
        for report in historical_reports:
            p_map = report.get("parameters", {})
            if param_name in p_map and p_map[param_name] is not None:
                val = float(p_map[param_name])
                if np.isfinite(val):
                    past_values.append(val)

        if not past_values:
            # First time this parameter has been measured: do NOT fabricate misleading zero deltas
            results[param_name] = {
                "current_value": curr_val,
                "previous_value": None,
                "absolute_change": None,
                "percentage_change": None,
                "direction": "baseline",
                "historical_mean": None,
                "historical_std": None,
                "number_of_previous_reports": 0,
            }
            continue

        # The most recent prior measurement
        prev_val = past_values[-1]
        abs_change = round(curr_val - prev_val, 2)
        pct_change = round((abs_change / prev_val) * 100.0, 1) if prev_val != 0 else 0.0

        if abs(pct_change) < 3.0:
            direction = "stable"
        elif pct_change > 0:
            direction = "increasing"
        else:
            direction = "decreasing"

        hist_mean = round(float(np.mean(past_values)), 2)
        hist_std = round(float(np.std(past_values)), 2) if len(past_values) > 1 else None

        results[param_name] = {
            "current_value": curr_val,
            "previous_value": prev_val,
            "absolute_change": abs_change,
            "percentage_change": pct_change,
            "direction": direction,
            "historical_mean": hist_mean,
            "historical_std": hist_std,
            "number_of_previous_reports": len(past_values),
        }

    return results
