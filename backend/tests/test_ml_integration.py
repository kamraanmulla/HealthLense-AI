"""
HealthLens AI - ML Integration Validation Test Suite (Pytest)
============================================================
Comprehensive test suite verifying ML anomaly detection, NHANES provenance,
feature counts, boundary integrity, and schema compliance.
"""

import json
from pathlib import Path
import joblib
import pytest

from app.ml.predictor import get_anomaly_predictor
from app.services.health.score_calculator import calculate_health_score
from app.services.ai.gemini_provider import GeminiProvider
from app.schemas.report import AIAnalysisResult


@pytest.fixture(scope="module")
def predictor():
    pred = get_anomaly_predictor()
    assert pred.is_available(), "ML anomaly model bundle must be available"
    return pred


def test_01_model_loading(predictor):
    """Verify model bundle loads and is available for inference."""
    assert predictor.is_available() is True


def test_02_normal_report(predictor):
    """Verify that a normal panel of biomarkers is NOT flagged as an anomaly."""
    normal_params = [
        {"parameter_name": "Hemoglobin", "value": 14.2},
        {"parameter_name": "RBC", "value": 4.8},
        {"parameter_name": "WBC", "value": 6.8},
        {"parameter_name": "Platelets", "value": 240.0},
        {"parameter_name": "MCV", "value": 87.0},
        {"parameter_name": "MCH", "value": 29.0},
        {"parameter_name": "MCHC", "value": 33.5},
        {"parameter_name": "Creatinine", "value": 0.9},
        {"parameter_name": "Glucose (Fasting)", "value": 92.0},
        {"parameter_name": "HbA1c", "value": 5.4},
    ]
    res = predictor.predict(normal_params)
    assert res["anomaly_detected"] is False, "Normal lab readings must not be flagged as anomaly"
    assert res["anomaly_level"] in ["normal", "low"]
    assert res["anomaly_score"] < 0.70


def test_03_unusual_multivariable_pattern(predictor):
    """Verify that multi-organ out-of-range biomarkers trigger an anomaly."""
    unusual_params = [
        {"parameter_name": "Creatinine", "value": 2.9},
        {"parameter_name": "Urea", "value": 75.0},
        {"parameter_name": "SGOT", "value": 150.0},
        {"parameter_name": "SGPT", "value": 210.0},
        {"parameter_name": "Glucose (Fasting)", "value": 220.0},
        {"parameter_name": "HbA1c", "value": 9.8},
    ]
    res = predictor.predict(unusual_params)
    assert res["anomaly_detected"] is True, "Severely atypical multivariable pattern must be flagged"
    assert len(res["affected_parameters"]) > 0
    assert res["anomaly_score"] >= 0.70
    assert res["anomaly_level"] in ["medium", "high"]


def test_04_missing_parameters_single_param(predictor):
    """Verify graceful handling with only 1 supported parameter."""
    single_param = [{"parameter_name": "Hemoglobin", "value": 14.0}]
    res = predictor.predict(single_param)
    assert "anomaly_detected" in res
    assert "anomaly_level" in res
    assert res["anomaly_detected"] is False


def test_05_no_supported_parameters(predictor):
    """Verify graceful fallback when report has no recognized quantitative features."""
    no_params = [{"parameter_name": "UnknownTest", "value": 42.0}]
    res = predictor.predict(no_params)
    assert res["anomaly_detected"] is False
    assert res["anomaly_level"] == "normal"


def test_06_invalid_and_none_values(predictor):
    """Verify resilience against None, NaN, and string inputs."""
    bad_params = [
        {"parameter_name": "Hemoglobin", "value": None},
        {"parameter_name": "RBC", "value": float("nan")},
        {"parameter_name": "WBC", "value": "not_a_number"},
        {"parameter_name": "Creatinine", "value": 0.9},
    ]
    res = predictor.predict(bad_params)
    assert res is not None
    assert "Creatinine" in res["parameters_analyzed"]


def test_07_personal_vs_population_longitudinal(predictor):
    """Verify personal baseline changes are computed from user history, not NHANES."""
    current = [{"parameter_name": "Creatinine", "value": 1.5}, {"parameter_name": "Urea", "value": 40.0}]
    history = [
        {"parameters": {"Creatinine": 0.8, "Urea": 18.0}},
        {"parameters": {"Creatinine": 0.9, "Urea": 20.0}},
    ]
    res = predictor.predict(current, historical_reports=history)
    assert len(res["longitudinal_changes"]) == 2
    # Prior value must come from latest user report (0.9), not NHANES population median
    creat_change = next(c for c in res["longitudinal_changes"] if c["parameter"] == "Creatinine")
    assert creat_change["previous_value"] == 0.9
    assert creat_change["current_value"] == 1.5
    assert creat_change["direction"] in ["increasing", "increased"]


def test_08_feature_counts_and_schema_alignment():
    """Verify exact feature counts match architecture specification."""
    artifacts_dir = Path(__file__).resolve().parent.parent / "app" / "ml" / "model_artifacts"
    bundle = joblib.load(artifacts_dir / "health_anomaly_model.joblib")
    bio_model = bundle["models"]["biochemistry_metabolic"]
    cbc_model = bundle["models"]["hematology_cbc"]

    with open(artifacts_dir / "feature_schema.json", encoding="utf-8") as f:
        schema = json.load(f)

    bio_features = bio_model.feature_names
    cbc_features = cbc_model.feature_names

    assert len(bio_features) == 24, f"Expected 24 biochemistry features, found {len(bio_features)}"
    assert len(cbc_features) == 11, f"Expected 11 CBC features, found {len(cbc_features)}"
    assert bio_features == schema["panels"]["biochemistry_metabolic"]["features"]
    assert cbc_features == schema["panels"]["hematology_cbc"]["features"]

    # Verify derived numerical feature counts
    bio_derived = [f for f in bio_features if "ratio" in f]
    cbc_derived = [f for f in cbc_features if "ratio" in f]
    assert len(bio_derived) == 5, f"Expected 5 derived ratio features, found {len(bio_derived)}"
    assert len(cbc_derived) == 2, f"Expected 2 derived ratio features, found {len(cbc_derived)}"


def test_09_nhanes_provenance_and_metadata():
    """Verify NHANES cycles, explicit cycle separation, and contamination wording."""
    artifacts_dir = Path(__file__).resolve().parent.parent / "app" / "ml" / "model_artifacts"
    with open(artifacts_dir / "model_metadata.json", encoding="utf-8") as f:
        meta = json.load(f)

    datasets = {d["file"]: d["cycle"] for d in meta["training_datasets"]}
    assert "August 2021–August 2023 (Cycle L)" in datasets["BIOPRO_L.xpt"]
    assert "August 2021–August 2023 (Cycle L)" in datasets["GHB_L.xpt"]
    assert "August 2021–August 2023 (Cycle L)" in datasets["GLU_L.xpt"]
    assert "2017–2018 (Cycle J)" in datasets["CBC_J.xpt"]
    assert "2015–2016 (Cycle I)" in datasets["HSCRP_I.xpt"]

    # Contamination parameter wording
    assert "0.06" in meta["contamination_wording"]
    assert "6% expected anomaly rate" not in json.dumps(meta)


def test_10_deterministic_health_score_isolation():
    """Verify health score calculation is deterministic and never altered by ML."""
    test_params = [
        {"parameter_name": "Hemoglobin", "value": 14.2, "status": "normal"},
        {"parameter_name": "Creatinine", "value": 0.9, "status": "normal"},
    ]
    score, risk, grade, conf, expl = calculate_health_score(test_params)
    assert score > 90
    assert risk == "LOW"
    assert grade in ["A+", "A", "Optimal", "Good"]

    import inspect
    sig = inspect.signature(GeminiProvider.analyze_report)
    assert "ml_findings" in sig.parameters


def test_11_pydantic_schema_validation(predictor):
    """Verify AIAnalysisResult schema validates serialized ML results without errors."""
    unusual_params = [
        {"parameter_name": "Creatinine", "value": 2.9},
        {"parameter_name": "Urea", "value": 75.0},
        {"parameter_name": "SGOT", "value": 150.0},
        {"parameter_name": "SGPT", "value": 210.0},
        {"parameter_name": "Glucose (Fasting)", "value": 220.0},
        {"parameter_name": "HbA1c", "value": 9.8},
    ]
    res = predictor.predict(unusual_params)
    full_ai = {
        "health_score": 75.0,
        "risk_level": "MODERATE",
        "summary": "Educational Test Summary",
        "ml_anomaly_detection": res,
    }
    validated = AIAnalysisResult.model_validate(full_ai)
    assert validated.ml_anomaly_detection is not None
    assert validated.ml_anomaly_detection.anomaly_detected is True
    assert validated.ml_anomaly_detection.model_version == "1.0.0"
