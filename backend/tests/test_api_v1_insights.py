"""
Automated Test Suite for Phase 3 Insights and Assistant API Endpoints
====================================================================
Tests authentication, input validation, privacy & user isolation,
and correct response models across all new endpoints.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.main import create_application
from app.models.user import User

app = create_application()
client = TestClient(app)


@pytest.fixture(scope="module")
def auth_headers():
    """Provides valid JWT Bearer headers for an existing active test user."""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.is_active == True).first()
        assert user is not None, "No active user found in test database"
        token = create_access_token(user_id=user.id)
        return {"Authorization": f"Bearer {token}"}, user.id
    finally:
        db.close()


# ── 1. Authentication & Security Enforcement ──────────────────────────────────
def test_unauthenticated_requests_are_rejected():
    """Verifies that protected insight and assistant routes reject requests missing Bearer tokens."""
    unauth_endpoints = [
        ("GET", "/api/v1/insights/knowledge-graph/explore"),
        ("GET", "/api/v1/insights/search/pathway"),
        ("POST", "/api/v1/insights/optimization/benchmark"),
        ("POST", "/api/v1/insights/logic/explain"),
        ("GET", "/api/v1/insights/trends/trajectory/glucose"),
        ("POST", "/api/v1/insights/cohort/classify"),
        ("GET", "/api/v1/insights/clustering/cohorts"),
        ("POST", "/api/v1/assistant/chat"),
    ]

    for method, path in unauth_endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"Endpoint {path} allowed unauthenticated access (status {res.status_code})"


# ── 2. Knowledge Graph Explorer (Exp 2 BFS/DFS) ────────────────────────────────
def test_api_knowledge_graph_explore(auth_headers):
    headers, _ = auth_headers

    # Breadth mode
    res = client.get(
        "/api/v1/insights/knowledge-graph/explore?concept=Cardiovascular&target=Total+Cholesterol&mode=breadth",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["start_concept"] == "Cardiovascular"
    assert data["target_concept"] == "Total Cholesterol"
    assert data["distance_hops"] == 2
    assert "Total Cholesterol" in data["connected_path"]
    assert len(data["network_structure"]) > 0

    # Depth mode
    res_depth = client.get(
        "/api/v1/insights/knowledge-graph/explore?concept=Metabolic+System&mode=depth",
        headers=headers,
    )
    assert res_depth.status_code == 200
    assert res_depth.json()["traversal_mode"] == "depth"


# ── 3. Pathway Navigation Router (Exp 3 Greedy BFS & A*) ──────────────────────
def test_api_search_pathway(auth_headers):
    headers, _ = auth_headers

    # A* optimal routing
    res = client.get(
        "/api/v1/insights/search/pathway?start_panel=Patient+Intake&target_marker=HbA1c&strategy=optimal",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["strategy"] == "optimal"
    assert data["path_found"] is True
    assert data["path"][0] == "Patient Intake"
    assert data["path"][-1] == "HbA1c"
    assert data["total_transition_cost"] > 0

    # Greedy directed routing
    res_greedy = client.get(
        "/api/v1/insights/search/pathway?start_panel=Patient+Intake&target_marker=Serum+Creatinine&strategy=directed",
        headers=headers,
    )
    assert res_greedy.status_code == 200
    assert res_greedy.json()["strategy"] == "directed"


# ── 4. Optimization Benchmark (Exp 4 Local Search) ────────────────────────────
def test_api_optimization_benchmark(auth_headers):
    headers, _ = auth_headers

    # Simulated annealing benchmark
    res = client.post(
        "/api/v1/insights/optimization/benchmark",
        json={"algorithm_type": "annealing", "initial_values": [1.5, -1.5], "max_steps": 100},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["optimizer_type"] == "Simulated Annealing"
    assert data["final_objective_score"] <= data["initial_score"]
    assert len(data["convergence_profile"]) > 0

    # Validation: out of bounds step count
    res_invalid = client.post(
        "/api/v1/insights/optimization/benchmark",
        json={"algorithm_type": "climbing", "max_steps": 5},  # min is 10
        headers=headers,
    )
    assert res_invalid.status_code == 422


# ── 5. Logic Explanation Traces (Exp 5 Rule Engine) & User Isolation ───────────
def test_api_logic_explain(auth_headers):
    headers, user_id = auth_headers

    # Forward deduction with custom facts
    res = client.post(
        "/api/v1/insights/logic/explain",
        json={"custom_facts": {"hemoglobin_low": True, "mcv_low": True}},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "Data-Driven Findings Deduction"
    assert len(data["findings_explained"]) > 0
    assert "R1_ANEMIA_SUSPICION" in data["rules_applied"]
    assert len(data["transparent_audit_trace"]) > 0

    # Privacy / User Isolation: trying to access nonexistent or unowned report
    res_unauthorized = client.post(
        "/api/v1/insights/logic/explain",
        json={"report_id": "00000000-0000-0000-0000-000000000000"},
        headers=headers,
    )
    assert res_unauthorized.status_code == 404


# ── 6. Metric Trajectory & Data Foundation (Exp 6 + Exp 1) ─────────────────────
def test_api_metric_trajectory(auth_headers):
    headers, _ = auth_headers

    res = client.get(
        "/api/v1/insights/trends/trajectory/glucose",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["parameter_name"] == "glucose"
    assert "descriptive_statistics" in data
    assert "data_quality_score" in data
    assert "educational_disclaimer" in data


# ── 7. Cohort Classification Benchmark (Exp 7 Classification) ─────────────────
def test_api_cohort_classify(auth_headers):
    headers, _ = auth_headers

    # Decision tree classification
    res = client.post(
        "/api/v1/insights/cohort/classify",
        json={"classifier_type": "tree", "sample_size": 120},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "Decision Tree" in data["classifier"]
    assert 0.0 <= data["accuracy_score"] <= 1.0
    assert len(data["confusion_matrix"]) == 2
    assert data["transparent_decision_rules"] is not None


# ── 8. Biomarker Clustering (Exp 8 K-Means) ───────────────────────────────────
def test_api_clustering_cohorts(auth_headers):
    headers, _ = auth_headers

    # 1. User reports mode: tests user isolation and valid response schema
    res_user = client.get(
        "/api/v1/insights/clustering/cohorts?clusters=3&source=user",
        headers=headers,
    )
    assert res_user.status_code == 200
    user_data = res_user.json()
    assert "has_sufficient_data" in user_data
    assert "scatter_points" in user_data
    assert "educational_disclaimer" in user_data
    assert user_data["is_synthetic"] is False

    # 2. Educational simulation benchmark: tests K-Means clustering algorithm
    res_demo = client.get(
        "/api/v1/insights/clustering/cohorts?clusters=3&source=demo",
        headers=headers,
    )
    assert res_demo.status_code == 200
    demo_data = res_demo.json()
    assert demo_data["group_count"] == 3
    assert demo_data["cohesion_inertia"] > 0
    assert len(demo_data["cohort_profiles"]) == 3
    assert len(demo_data["scatter_points"]) > 0
    assert demo_data["is_synthetic"] is True



# ── 9. AI Health Assistant & NLP Grounding (Exp 9 NLP + Assistant) ─────────────
def test_api_assistant_chat(auth_headers):
    headers, _ = auth_headers

    # General explanation query
    res = client.post(
        "/api/v1/assistant/chat",
        json={"question": "What is the role of hemoglobin in blood oxygenation?"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 10
    assert data["classified_intent"] == "explanation"
    assert "Hemoglobin" in data["referenced_biomarkers"]
    assert data["is_report_specific"] is False
    assert "educational" in data["disclaimer"].lower()

    # Unauthorized report access check
    res_bad_report = client.post(
        "/api/v1/assistant/chat",
        json={"question": "Explain my results", "report_id": "non-existent-report-uuid"},
        headers=headers,
    )
    assert res_bad_report.status_code == 404


def test_api_nlp_analyze(auth_headers):
    headers, _ = auth_headers

    res = client.post(
        "/api/v1/insights/nlp/analyze",
        json={"text": "What is my fasting glucose reference range?"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["query_intent"] == "range_query"
    assert "Glucose" in data["identified_biomarkers"]
    assert len(data["cleaned_tokens"]) > 0
    assert "VERIFIED CLINICAL REPORT PARAMETERS" in data["grounded_context_prompt"]
