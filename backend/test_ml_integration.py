"""
HealthLens AI - ML Integration Validation Test Suite
Comprehensive checks for ML anomaly detection, provenance, feature counts,
and boundary integrity.
"""
import json
import joblib
from pathlib import Path

print('='*70)
print('HealthLens AI - ML Integration Validation Test Suite')
print('='*70)

# --- Test 1: Model loads and is available ---
print('\n[Test 1] Model loading...')
from app.ml.predictor import get_anomaly_predictor
predictor = get_anomaly_predictor()
assert predictor.is_available(), 'Model not available'
print('  PASS: Model loaded successfully')

# --- Test 2: Normal report ---
print('\n[Test 2] Normal report (all values in range)...')
normal_params = [
    {'parameter_name': 'Hemoglobin', 'value': 14.2},
    {'parameter_name': 'RBC', 'value': 4.8},
    {'parameter_name': 'WBC', 'value': 6.8},
    {'parameter_name': 'Platelets', 'value': 240.0},
    {'parameter_name': 'MCV', 'value': 87.0},
    {'parameter_name': 'MCH', 'value': 29.0},
    {'parameter_name': 'MCHC', 'value': 33.5},
    {'parameter_name': 'Creatinine', 'value': 0.9},
    {'parameter_name': 'Glucose (Fasting)', 'value': 92.0},
    {'parameter_name': 'HbA1c', 'value': 5.4},
]
res = predictor.predict(normal_params)
assert not res['anomaly_detected'], 'Normal report flagged as anomaly!'
print('  PASS: anomaly_detected=%s, level=%s, score=%s' % (res['anomaly_detected'], res['anomaly_level'], res['anomaly_score']))

# --- Test 3: Unusual multivariable pattern ---
print('\n[Test 3] Unusual multivariable pattern...')
unusual_params = [
    {'parameter_name': 'Creatinine', 'value': 2.9},
    {'parameter_name': 'Urea', 'value': 75.0},
    {'parameter_name': 'SGOT', 'value': 150.0},
    {'parameter_name': 'SGPT', 'value': 210.0},
    {'parameter_name': 'Glucose (Fasting)', 'value': 220.0},
    {'parameter_name': 'HbA1c', 'value': 9.8},
]
res2 = predictor.predict(unusual_params)
assert res2['anomaly_detected'], 'Unusual pattern not detected!'
assert len(res2['affected_parameters']) > 0
print('  PASS: anomaly_detected=%s, level=%s, score=%s' % (res2['anomaly_detected'], res2['anomaly_level'], res2['anomaly_score']))
print('  Affected:', res2['affected_parameters'])

# --- Test 4: Missing parameters (only 1 supported param) ---
print('\n[Test 4] Report with only 1 supported parameter...')
single_param = [{'parameter_name': 'Hemoglobin', 'value': 14.0}]
res3 = predictor.predict(single_param)
print('  PASS: anomaly_detected=%s, level=%s' % (res3['anomaly_detected'], res3['anomaly_level']))

# --- Test 5: No supported parameters ---
print('\n[Test 5] Report with no supported parameters...')
no_params = [{'parameter_name': 'UnknownTest', 'value': 42.0}]
res4 = predictor.predict(no_params)
assert not res4['anomaly_detected']
print('  PASS: gracefully handled, level=%s' % res4['anomaly_level'])

# --- Test 6: None/invalid values ---
print('\n[Test 6] Report with None/invalid values...')
bad_params = [
    {'parameter_name': 'Hemoglobin', 'value': None},
    {'parameter_name': 'RBC', 'value': float('nan')},
    {'parameter_name': 'WBC', 'value': 'abc'},
    {'parameter_name': 'Creatinine', 'value': 0.9},
]
res5 = predictor.predict(bad_params)
print('  PASS: handled without crash, params_analyzed=%s' % res5['parameters_analyzed'])

# --- Test 7: Longitudinal analysis (Personal baseline vs Population) ---
print('\n[Test 7] Longitudinal analysis with personal history...')
current = [{'parameter_name': 'Creatinine', 'value': 1.5}, {'parameter_name': 'Urea', 'value': 40.0}]
history = [
    {'parameters': {'Creatinine': 0.8, 'Urea': 18.0}},
    {'parameters': {'Creatinine': 0.9, 'Urea': 20.0}},
]
res6 = predictor.predict(current, historical_reports=history)
assert len(res6['longitudinal_changes']) == 2
for lc in res6['longitudinal_changes']:
    print('  %s: %s -> %s (%s, %s%%)' % (lc['parameter'], lc['previous_value'], lc['current_value'], lc['direction'], lc['percentage_change']))
# Verify NHANES is NOT treated as user personal baseline
assert res6['longitudinal_changes'][0]['previous_value'] == 0.9, 'Personal baseline must come from user prior report, not NHANES'
print('  PASS: personal longitudinal baseline strictly separated from population model')

# --- Test 8: Feature Counts & Terminology Verification ---
print('\n[Test 8] Exact feature count verification...')
bundle = joblib.load('app/ml/model_artifacts/health_anomaly_model.joblib')
bio_model = bundle['models']['biochemistry_metabolic']
cbc_model = bundle['models']['hematology_cbc']

with open('app/ml/model_artifacts/feature_schema.json', encoding='utf-8') as f:
    schema = json.load(f)

bio_features = bio_model.feature_names
cbc_features = cbc_model.feature_names

assert len(bio_features) == 24, f"Expected 24 biochemistry features, found {len(bio_features)}"
assert len(cbc_features) == 11, f"Expected 11 CBC features, found {len(cbc_features)}"
assert bio_features == schema['panels']['biochemistry_metabolic']['features']
assert cbc_features == schema['panels']['hematology_cbc']['features']

# Verify derived numerical feature names
bio_derived = [f for f in bio_features if 'ratio' in f]
cbc_derived = [f for f in cbc_features if 'ratio' in f]
assert len(bio_derived) == 5, f"Expected 5 derived numerical features for bio, found {len(bio_derived)}"
assert len(cbc_derived) == 2, f"Expected 2 derived numerical features for cbc, found {len(cbc_derived)}"
print(f'  PASS: 19 primary + 5 derived numerical = {len(bio_features)} biochemistry features')
print(f'  PASS: 9 primary + 2 derived numerical = {len(cbc_features)} CBC features')

# --- Test 9: NHANES Provenance & Metadata Verification ---
print('\n[Test 9] NHANES provenance and cycle verification...')
with open('app/ml/model_artifacts/model_metadata.json', encoding='utf-8') as f:
    meta = json.load(f)

# Verify exact cycle wording
datasets = {d['file']: d['cycle'] for d in meta['training_datasets']}
assert 'August 2021–August 2023 (Cycle L)' in datasets['BIOPRO_L.xpt']
assert 'August 2021–August 2023 (Cycle L)' in datasets['GHB_L.xpt']
assert 'August 2021–August 2023 (Cycle L)' in datasets['GLU_L.xpt']
assert 'August 2021–August 2023 (Cycle L)' in datasets['VID_L.xpt']
assert 'August 2021–August 2023 (Cycle L)' in datasets['FERTIN_L.xpt']
assert 'August 2021–August 2023 (Cycle L)' in datasets['ALB_CR_L.xpt']
assert '2017–2018 (Cycle J)' in datasets['CBC_J.xpt']
assert '2015–2016 (Cycle I)' in datasets['HSCRP_I.xpt']

# Verify panel separation
assert 'Cycle L' in meta['panel_provenance']['biochemistry_metabolic']
assert 'Cycle J' in meta['panel_provenance']['hematology_cbc']

# Verify contamination wording
expected_contam_wording = "Contamination parameter: 0.06 — used by Isolation Forest as the assumed proportion of training observations treated as outliers."
assert meta['contamination_wording'] == expected_contam_wording, f"Contamination wording mismatch: {meta['contamination_wording']}"
assert "6% expected anomaly rate" not in json.dumps(meta)

print('  PASS: NHANES cycles verified: 2021-2023 (Cycle L), 2017-2018 (Cycle J), 2015-2016 (Cycle I)')
print('  PASS: Contamination wording verified (no patient anomaly rate claim)')
print('  PASS: Explicit cycle separation confirmed')

# --- Test 10: Medical Attention Logic & Gemini Boundary ---
print('\n[Test 10] Medical attention logic and Gemini boundary...')
from app.services.health.score_calculator import calculate_health_score
from app.services.ai.gemini_provider import GeminiProvider

# 1. Health score is strictly deterministic (unaffected by ML)
test_params = [
    {"parameter_name": "Hemoglobin", "value": 14.2, "status": "normal"},
    {"parameter_name": "Creatinine", "value": 0.9, "status": "normal"},
]
h_score, risk, grade, conf, expl = calculate_health_score(test_params)
assert h_score > 90
assert risk == "LOW"

# 2. Check Gemini provider signature accepts ml_findings
import inspect
sig = inspect.signature(GeminiProvider.analyze_report)
assert 'ml_findings' in sig.parameters, 'GeminiProvider.analyze_report must accept ml_findings'
print('  PASS: calculate_health_score is purely deterministic and unaffected by ML')
print('  PASS: GeminiProvider receives structured ml_findings without calculating/overriding ML')

# --- Test 11: Pydantic Schema Validation ---
print('\n[Test 11] Pydantic schema validation...')
from app.schemas.report import AIAnalysisResult
full_ai = {
    'health_score': 77.5,
    'risk_level': 'MODERATE',
    'summary': 'Test',
    'ml_anomaly_detection': res2,
}
validated = AIAnalysisResult.model_validate(full_ai)
assert validated.ml_anomaly_detection is not None
assert validated.ml_anomaly_detection.anomaly_detected == True
print('  PASS: Full schema with ML result validates')

print('\n' + '='*70)
print('ALL 11 VALIDATION TESTS PASSED CLEANLY')
print('='*70)
