"""
HealthLens AI — Offline Model Training Script
==============================================
Trains Isolation Forest anomaly detection models on the real NHANES datasets.
Generates model artifacts and schema metadata for zero-latency inference.

Usage:
    python -m app.ml.train_model
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import joblib
import pandas as pd
import numpy as np

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.ml.dataset_loader import (
    find_nhanes_files,
    load_biochemistry_dataset,
    load_cbc_dataset,
)
from app.ml.feature_engineering import (
    compute_biochemistry_features,
    compute_cbc_features,
    BIOCHEMISTRY_PRIMARY_PARAMETERS,
    CBC_PRIMARY_PARAMETERS,
)
from app.ml.anomaly_model import PanelAnomalyDetector


ARTIFACTS_DIR = Path(__file__).resolve().parent / "model_artifacts"


def train_models(output_dir: Path = ARTIFACTS_DIR) -> None:
    """
    Main training execution function.
    Loads real NHANES datasets, constructs feature sets, fits models,
    validates behavior, and saves serialized artifacts.
    """
    start_time = datetime.now(timezone.utc)
    print("=" * 70)
    print("HealthLens AI -- Clinical Anomaly Detection Model Training")
    print("=" * 70)

    # 1. Locate files
    print("\n[1/6] Searching for NHANES dataset files...")
    located = find_nhanes_files()
    if not located:
        print("ERROR: No NHANES .xpt files found in expected directories!")
        sys.exit(1)

    print(f"  Located {len(located)} dataset files:")
    for fname, path in sorted(located.items()):
        print(f"    * {fname:<15} ({path.stat().st_size / 1024:.1f} KB) -> {path}")

    # 2. Load and merge datasets
    print("\n[2/6] Loading and cleaning datasets...")
    bio_raw = load_biochemistry_dataset(located)
    print(f"  Biochemistry/Metabolic participants: {len(bio_raw):,} records")

    cbc_raw = load_cbc_dataset(located)
    print(f"  Complete Blood Count participants:   {len(cbc_raw):,} records")

    # 3. Feature engineering
    print("\n[3/6] Generating model features (primary parameters + derived numerical features)...")
    bio_features = compute_biochemistry_features(bio_raw)
    cbc_features = compute_cbc_features(cbc_raw)

    print(f"  Biochemistry feature matrix: {bio_features.shape[0]:,} rows x {bio_features.shape[1]} features (19 primary laboratory values + 5 derived numerical features = 24 model features)")
    print(f"    Features: {list(bio_features.columns)}")
    print(f"  CBC feature matrix:          {cbc_features.shape[0]:,} rows x {cbc_features.shape[1]} features (9 primary CBC parameters + 2 derived numerical features = 11 model features)")
    print(f"    Features: {list(cbc_features.columns)}")

    # 4. Train Isolation Forest models
    print("\n[4/6] Fitting Panel Isolation Forest models...")

    # Biochemistry & Metabolic Detector
    bio_detector = PanelAnomalyDetector(
        panel_name="biochemistry_metabolic",
        feature_names=list(bio_features.columns),
        contamination=0.06,
        n_estimators=150,
        random_state=42,
    )
    bio_detector.fit(bio_features)
    print(f"  [+] Biochemistry detector trained. Features={len(bio_detector.feature_names)}")

    # Complete Blood Count Detector
    cbc_detector = PanelAnomalyDetector(
        panel_name="hematology_cbc",
        feature_names=list(cbc_features.columns),
        contamination=0.06,
        n_estimators=150,
        random_state=42,
    )
    cbc_detector.fit(cbc_features)
    print(f"  [+] Hematology/CBC detector trained. Features={len(cbc_detector.feature_names)}")

    # 5. Evaluate training quality & distribution
    print("\n[5/6] Evaluating data quality & model behavior...")
    
    # Test sample evaluation
    sample_normal_bio = {
        "Creatinine": 0.9, "Urea": 18.0, "Albumin": 4.2, "Total Protein": 7.1,
        "SGOT": 22.0, "SGPT": 20.0, "Sodium": 140.0, "Potassium": 4.2,
        "Calcium": 9.5, "Glucose (Fasting)": 90.0, "HbA1c": 5.2,
        "Total Cholesterol": 180.0, "Triglycerides": 110.0, "BUN_Creatinine_ratio": 20.0,
        "AST_ALT_ratio": 1.1, "AG_ratio": 1.45, "Na_K_ratio": 33.3, "Trig_Chol_ratio": 0.61
    }
    sample_unusual_bio = {
        "Creatinine": 2.8, "Urea": 68.0, "Albumin": 3.0, "Total Protein": 8.5,
        "SGOT": 140.0, "SGPT": 195.0, "Sodium": 131.0, "Potassium": 5.8,
        "Calcium": 8.0, "Glucose (Fasting)": 210.0, "HbA1c": 9.8,
        "Total Cholesterol": 290.0, "Triglycerides": 480.0, "BUN_Creatinine_ratio": 24.3,
        "AST_ALT_ratio": 0.72, "AG_ratio": 0.55, "Na_K_ratio": 22.6, "Trig_Chol_ratio": 1.66
    }

    norm_res = bio_detector.predict_sample(sample_normal_bio, ["Creatinine", "Urea", "Glucose (Fasting)"])
    unusual_res = bio_detector.predict_sample(sample_unusual_bio, ["Creatinine", "Urea", "Glucose (Fasting)", "SGOT", "SGPT"])

    print(f"  Evaluation test (Normal Sample):  score={norm_res['anomaly_score']} level={norm_res['anomaly_level']} detected={norm_res['anomaly_detected']}")
    print(f"  Evaluation test (Unusual Sample): score={unusual_res['anomaly_score']} level={unusual_res['anomaly_level']} detected={unusual_res['anomaly_detected']}")
    print(f"    Affected parameters identified: {unusual_res['affected_parameters']}")

    assert not norm_res["anomaly_detected"], "Normal baseline should not be flagged as high anomaly"
    assert unusual_res["anomaly_detected"], "Extreme multivariable sample must be flagged as anomaly"

    # 6. Save Artifacts
    print("\n[6/6] Saving trained model artifacts and schemas...")
    output_dir.mkdir(parents=True, exist_ok=True)

    model_bundle = {
        "models": {
            "biochemistry_metabolic": bio_detector,
            "hematology_cbc": cbc_detector,
        },
        "version": "1.0.0",
        "created_at": start_time.isoformat(),
    }

    model_path = output_dir / "health_anomaly_model.joblib"
    joblib.dump(model_bundle, model_path, compress=3)
    print(f"  [+] Saved models to: {model_path} ({model_path.stat().st_size / 1024:.1f} KB)")

    # Save feature schemas
    feature_schema = {
        "panels": {
            "biochemistry_metabolic": {
                "features": bio_detector.feature_names,
                "primary_parameters": BIOCHEMISTRY_PRIMARY_PARAMETERS,
                "medians": bio_detector.preprocessor.medians,
                "iqr_lower": bio_detector.preprocessor.iqr_lower,
                "iqr_upper": bio_detector.preprocessor.iqr_upper,
            },
            "hematology_cbc": {
                "features": cbc_detector.feature_names,
                "primary_parameters": CBC_PRIMARY_PARAMETERS,
                "medians": cbc_detector.preprocessor.medians,
                "iqr_lower": cbc_detector.preprocessor.iqr_lower,
                "iqr_upper": cbc_detector.preprocessor.iqr_upper,
            },
        },
        "model_version": "1.0.0",
    }
    schema_path = output_dir / "feature_schema.json"
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(feature_schema, f, indent=2)
    print(f"  [+] Saved feature schema to: {schema_path}")

    # Save model metadata (NO PII)
    metadata = {
        "model_name": "HealthLens Population Anomaly Detector",
        "model_type": "Isolation Forest (scikit-learn)",
        "model_version": "1.0.0",
        "training_date": start_time.isoformat(),
        "training_datasets": [
            {"file": "BIOPRO_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Standard Biochemistry Profile", "samples": len(bio_raw)},
            {"file": "GHB_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Glycohemoglobin (HbA1c)"},
            {"file": "GLU_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Fasting Glucose"},
            {"file": "VID_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Vitamin D"},
            {"file": "FERTIN_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Ferritin"},
            {"file": "ALB_CR_L.xpt", "cycle": "August 2021–August 2023 (Cycle L)", "domain": "Urine Albumin & Creatinine"},
            {"file": "CBC_J.xpt", "cycle": "2017–2018 (Cycle J)", "domain": "Complete Blood Count with 5-part Differential", "samples": len(cbc_raw)},
            {"file": "HSCRP_I.xpt", "cycle": "2015–2016 (Cycle I)", "domain": "High-Sensitivity CRP (hs-CRP)"},
        ],
        "panel_provenance": {
            "biochemistry_metabolic": "Trained on NHANES August 2021–August 2023 (Cycle L)",
            "hematology_cbc": "Trained on NHANES 2017–2018 (Cycle J)",
        },
        "cycle_separation_guarantee": "Different NHANES survey cycles are kept explicitly separated into panel-specific models and not cross-merged across survey cohorts.",
        "panels_trained": ["biochemistry_metabolic", "hematology_cbc"],
        "feature_breakdown": {
            "biochemistry_metabolic": "19 primary laboratory values + 5 derived numerical features = 24 model features",
            "hematology_cbc": "9 primary CBC parameters + 2 derived numerical features = 11 model features",
        },
        "total_population_participants": len(bio_raw) + len(cbc_raw),
        "contamination": 0.06,
        "contamination_wording": "Contamination parameter: 0.06 — used by Isolation Forest as the assumed proportion of training observations treated as outliers.",
        "n_estimators": 150,
        "baseline_distinction": "Population anomaly detection evaluates multivariable patterns relative to the NHANES reference population. Personal longitudinal analysis calculates current-vs-previous changes from the user's own historical reports. NHANES is strictly not treated as the user's personal baseline.",
        "medical_attention_logic": "ML anomaly detection is an informational statistical signal alongside reference ranges, personal longitudinal changes, and deterministic clinical rules. ML anomaly detection alone does NOT determine medical urgency or clinical diagnosis.",
        "gemini_boundary": "Gemini receives structured computed findings (deterministic flags, personal longitudinal deltas, and ML anomaly classifications) rather than raw NHANES datasets. Gemini explains findings in accessible language and does not independently calculate or override the ML result.",
        "clinical_disclaimer": "This ML model detects statistical population anomalies in multivariable patterns. It is strictly non-diagnostic and does not replace qualified clinical assessment.",
    }
    metadata_path = output_dir / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"  [+] Saved model metadata to: {metadata_path}")

    print("\n" + "=" * 70)
    print("Training successfully completed!")
    print("=" * 70)


if __name__ == "__main__":
    train_models()
