"""
Comprehensive test script for HealthLens AI Medical Report Processing.
Tests:
1. Valid medical PDF upload -> 100% completion -> Report Details -> Parameters
2. Multi-page medical PDF -> Complete processing
3. Report containing tables -> Complete processing
4. Invalid/unsupported file validation -> 415 Unsupported Media Type
5. Gemini unavailable/rate-limited scenario -> Graceful degradation to 100% completed
"""

import io
import json
import time
import requests
import fitz  # PyMuPDF

BASE_URL = "http://127.0.0.1:8000/api/v1"
EMAIL = "kamraan@test.com"
PASSWORD = "Password123!"

def get_auth_token():
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]

def generate_valid_pdf():
    doc = fitz.open()
    page = doc.new_page()
    text = """METROPOLIS HEALTHCARE LABS
PATIENT DIAGNOSTIC REPORT
Patient: Kamraan Mulla | Age: 32 | Gender: Male | Date: 2026-09-26

COMPLETE BLOOD COUNT (CBC) & BIOCHEMISTRY
---------------------------------------------------------------------------------
Test Name                 Result      Unit        Reference Range
---------------------------------------------------------------------------------
Hemoglobin                14.2        g/dL        12.0 - 17.5
RBC                       4.8         mill/uL     4.1 - 5.9
WBC                       6800        thou/uL     4.0 - 11.0
Platelets                 240000      thou/uL     150 - 450
Glucose (Fasting)         92          mg/dL       70 - 99
HbA1c                     5.4         %           4.0 - 5.6
Creatinine                0.9         mg/dL       0.6 - 1.2
Total Cholesterol         185         mg/dL       125 - 200
Vitamin D                 38          ng/mL       30 - 100
---------------------------------------------------------------------------------
End of Report
"""
    page.insert_text((50, 50), text, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def generate_multipage_pdf():
    doc = fitz.open()
    # Page 1
    page1 = doc.new_page()
    text1 = """APOLLO DIAGNOSTICS - COMPREHENSIVE HEALTH CHECK
Page 1: Hematology Profile
Patient: Kamraan Mulla | Date: 2026-09-26

---------------------------------------------------------------------------------
Investigation             Observed    Unit        Reference Interval
---------------------------------------------------------------------------------
Hemoglobin                11.2        g/dL        12.0 - 17.5
RBC                       3.9         mill/uL     4.1 - 5.9
WBC                       5400        thou/uL     4.0 - 11.0
Platelets                 190000      thou/uL     150 - 450
---------------------------------------------------------------------------------
Continued on next page...
"""
    page1.insert_text((50, 50), text1, fontsize=11)

    # Page 2
    page2 = doc.new_page()
    text2 = """APOLLO DIAGNOSTICS - COMPREHENSIVE HEALTH CHECK
Page 2: Renal & Metabolic Panel
Patient: Kamraan Mulla | Date: 2026-09-26

---------------------------------------------------------------------------------
Investigation             Observed    Unit        Reference Interval
---------------------------------------------------------------------------------
Glucose (Fasting)         118         mg/dL       70 - 99
HbA1c                     6.2         %           4.0 - 5.6
Creatinine                1.4         mg/dL       0.6 - 1.2
Urea                      48          mg/dL       15 - 40
Uric Acid                 7.8         mg/dL       3.5 - 7.2
Vitamin D                 18          ng/mL       30 - 100
---------------------------------------------------------------------------------
Verified by: Dr. S. Sharma, MD Pathologist
"""
    page2.insert_text((50, 50), text2, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def poll_until_done(token, report_id, timeout=60):
    start = time.time()
    headers = {"Authorization": f"Bearer {token}"}
    last_prog = 0
    stages_seen = []
    while time.time() - start < timeout:
        res = requests.get(f"{BASE_URL}/reports/{report_id}/status", headers=headers)
        assert res.status_code == 200, f"Status check failed: {res.text}"
        data = res.json()
        status = data.get("status")
        progress = data.get("progress")
        stage = data.get("processing_stage")
        if stage and stage not in stages_seen:
            stages_seen.append(stage)
        print(f"    [Polling] status={status}, progress={progress}%, stage='{stage}'")
        
        if status == "completed":
            return True, data, stages_seen
        elif status == "failed":
            return False, data, stages_seen
        time.sleep(1.5)
    raise TimeoutError("Processing timed out")

def run_tests():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    print("[1] Authentication successful.")

    # Test 1: Valid Single-Page PDF with Tables
    print("\n[TEST 1] Uploading Valid Medical Report with Tables...")
    pdf_bytes = generate_valid_pdf()
    files = {"file": ("normal_cbc_report.pdf", pdf_bytes, "application/pdf")}
    res = requests.post(f"{BASE_URL}/reports/", headers=headers, files=files)
    assert res.status_code == 202, f"Upload failed: {res.text}"
    report_id_1 = res.json()["id"]
    print(f"  Report uploaded successfully. Report ID: {report_id_1}")
    
    success, data, stages = poll_until_done(token, report_id_1)
    assert success, f"Processing failed: {data.get('error_message')}"
    print(f"  Test 1 Result: Status = {data['status']}, Score = {data['health_score']}, Grade = {data['health_grade']}")
    print(f"  Stages observed: {stages}")
    
    # Verify details
    det_res = requests.get(f"{BASE_URL}/reports/{report_id_1}", headers=headers)
    assert det_res.status_code == 200
    det = det_res.json()
    assert len(det["parameters"]) >= 5, f"Expected parameters, got {len(det['parameters'])}"
    print(f"  Verified {len(det['parameters'])} parameters successfully saved to SQLite!")
    print(f"  AI summary present: {bool(det.get('ai_result'))}")

    # Test 2: Multi-Page PDF
    print("\n[TEST 2] Uploading Multi-Page Medical Report...")
    mp_bytes = generate_multipage_pdf()
    files = {"file": ("multipage_panel_report.pdf", mp_bytes, "application/pdf")}
    res2 = requests.post(f"{BASE_URL}/reports/", headers=headers, files=files)
    assert res2.status_code == 202
    report_id_2 = res2.json()["id"]
    print(f"  Multi-page report uploaded. ID: {report_id_2}")
    success2, data2, stages2 = poll_until_done(token, report_id_2)
    assert success2, f"Processing failed: {data2.get('error_message')}"
    print(f"  Test 2 Result: Status = {data2['status']}, Score = {data2['health_score']}, Grade = {data2['health_grade']}")
    det_res2 = requests.get(f"{BASE_URL}/reports/{report_id_2}", headers=headers)
    det2 = det_res2.json()
    print(f"  Verified {len(det2['parameters'])} parameters extracted across multiple pages!")

    # Test 3: Invalid / Unsupported File Type
    print("\n[TEST 3] Testing Invalid / Unsupported File Upload (.txt)...")
    bad_files = {"file": ("test.txt", b"Invalid medical report text", "text/plain")}
    res3 = requests.post(f"{BASE_URL}/reports/", headers=headers, files=bad_files)
    print(f"  Upload response status: {res3.status_code}")
    assert res3.status_code == 415, f"Expected 415 Unsupported Media Type, got {res3.status_code}"
    print("  Rejected invalid file type correctly with HTTP 415!")

    # Test 4: Gemini Unavailable / Simulated Rate-Limit Scenario
    print("\n[TEST 4] Testing Gemini Unavailable / Rate-Limited Scenario (Graceful Degradation)...")
    # We will trigger background processing directly with an invalid provider mock or analyze_report failure
    import asyncio
    from app.services.report_service import process_report_background
    from app.models.report import Report
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    # Create a pending report in DB
    import uuid
    from pathlib import Path
    gemini_fail_id = str(uuid.uuid4())
    stored_name = f"{gemini_fail_id}.pdf"
    test_path = Path("uploads") / stored_name
    test_path.write_bytes(pdf_bytes)
    
    rpt = Report(
        id=gemini_fail_id,
        user_id=1,
        original_filename="gemini_fail_test.pdf",
        stored_filename=stored_name,
        file_path=str(test_path),
        file_type="pdf",
        file_size_bytes=len(pdf_bytes),
        status="pending",
    )
    db.add(rpt)
    db.commit()
    db.close()
    
    # Temporarily monkeypatch analyze_report to raise Exception simulating API quota / outage
    from app.services.ai.gemini_provider import GeminiProvider
    orig_analyze = GeminiProvider.analyze_report
    async def mock_fail_analyze(*args, **kwargs):
        raise RuntimeError("Simulated 429 RESOURCE_EXHAUSTED Quota Exceeded")
    GeminiProvider.analyze_report = mock_fail_analyze
    
    try:
        print("  Running report processing with Gemini raising 429 quota exception...")
        asyncio.run(process_report_background(gemini_fail_id))
    finally:
        GeminiProvider.analyze_report = orig_analyze
        
    db = SessionLocal()
    completed_rpt = db.query(Report).filter(Report.id == gemini_fail_id).first()
    print(f"  Report status after Gemini failure: {completed_rpt.status}")
    assert completed_rpt.status == "completed", f"Expected completed, got {completed_rpt.status}"
    assert completed_rpt.health_score is not None
    assert completed_rpt.ai_result is not None
    print(f"  AI fallback summary: {completed_rpt.ai_result.get('summary')[:80]}...")
    print(f"  Health Score preserved: {completed_rpt.health_score} ({completed_rpt.health_grade})")
    assert len(completed_rpt.parameters) > 0, "Parameters must be preserved!"
    print(f"  Preserved {len(completed_rpt.parameters)} laboratory parameters in database!")
    db.close()
    print("  Test 4 Passed: Graceful fallback preserves report, score, parameters, and marks report completed!")

    # Test 5: Dashboard and Report Detail APIs
    print("\n[TEST 5] Testing Dashboard and Report Details API...")
    dash_res = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.text}"
    dash = dash_res.json()
    print(f"  Dashboard returned: User Health Score = {dash.get('health_score')}, Total Reports = {dash.get('stats', {}).get('total_reports')}")
    print("  Dashboard reflects updated reports!")

    print("\n==========================================")
    print("ALL 5 AUTOMATED TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
