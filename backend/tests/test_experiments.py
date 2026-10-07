"""
Automated Test Suite for the 9 AI/ML Laboratory Experiment Modules
==================================================================
Tests every algorithm on real outputs, expected mathematics, boundary conditions,
and invalid edge cases.
"""

import math
import numpy as np
import pytest

from app.experiments.exp1_data_foundation import DataFoundationService
from app.experiments.exp2_graph_traversal import MedicalKnowledgeGraph
from app.experiments.exp3_informed_search import MedicalSearchRouter
from app.experiments.exp4_local_search import ParameterOptimizer
from app.experiments.exp5_rule_engine import RuleEngine
from app.experiments.exp6_regression import TrendRegressionService
from app.experiments.exp7_classification import HealthPatternClassifier
from app.experiments.exp8_clustering import CohortClusterService
from app.experiments.exp9_nlp_engine import ClinicalNLPEngine


# ==============================================================================
# 1. Experiment 1: Data Foundation
# ==============================================================================
def test_exp1_clean_and_validate_measurements():
    svc = DataFoundationService()

    # Mixed valid, missing, and invalid records
    records = [
        {"name": "Hemoglobin", "value": 14.2, "unit": "g/dL"},
        {"name": "Platelets", "value": "250.5", "unit": "thou/uL"},
        {"name": "Glucose", "value": None, "unit": "mg/dL"},
        {"name": "WBC", "value": "not_a_number", "unit": "thou/uL"},
        {"name": "Creatinine", "value": -1.5, "unit": "mg/dL"},  # non-positive
    ]

    df, audit = svc.validate_and_clean_measurements(records)
    assert audit["total"] == 5
    assert audit["valid"] == 2  # Hemoglobin and Platelets
    assert audit["missing"] == 1  # Glucose
    assert audit["invalid"] == 1  # WBC
    assert audit["data_quality_score"] == 40.0
    assert len(df) == 5

    # Empty list edge case
    empty_df, empty_audit = svc.validate_and_clean_measurements([])
    assert empty_audit["total"] == 0
    assert empty_audit["valid"] == 0


def test_exp1_descriptive_statistics():
    svc = DataFoundationService()
    data = [10.0, 20.0, 30.0, 40.0, 50.0]
    stats = svc.compute_descriptive_statistics(data)

    assert stats["count"] == 5
    assert stats["mean"] == 30.0
    assert stats["median"] == 30.0
    assert stats["min"] == 10.0
    assert stats["max"] == 50.0
    assert stats["q25"] == 20.0
    assert stats["q75"] == 40.0
    assert stats["iqr"] == 20.0
    assert stats["std"] > 0

    # Empty data edge case
    empty_stats = svc.compute_descriptive_statistics([])
    assert empty_stats["count"] == 0
    assert empty_stats["mean"] is None


def test_exp1_unit_normalization():
    svc = DataFoundationService()

    # Fasting glucose: 100 mg/dL -> ~5.55 mmol/L
    converted, was_conv = svc.normalize_unit("Fasting Glucose", 100.0, "mg/dL", "mmol/L")
    assert was_conv is True
    assert round(converted, 2) == 5.55

    # Hemoglobin: 14.0 g/dL -> 140.0 g/L
    converted_hb, was_hb = svc.normalize_unit("Hemoglobin", 14.0, "g/dL", "g/L")
    assert was_hb is True
    assert converted_hb == 140.0

    # Same unit
    same_val, same_flag = svc.normalize_unit("Hemoglobin", 14.0, "g/dL", "g/dL")
    assert same_flag is False
    assert same_val == 14.0


# ==============================================================================
# 2. Experiment 2: Graph Traversal (BFS & DFS)
# ==============================================================================
def test_exp2_bfs_shortest_path():
    kg = MedicalKnowledgeGraph()

    # BFS from Cardiovascular to Total Cholesterol
    res = kg.breadth_first_search("Cardiovascular", "Total Cholesterol")
    assert res.start_node == "Cardiovascular"
    assert res.target_node == "Total Cholesterol"
    assert res.distance == 2
    assert res.path == ["Cardiovascular", "Lipid Profile", "Total Cholesterol"]
    assert res.visited_count > 0
    assert len(res.traversal_tree) > 0

    # BFS with nonexistent start node
    invalid_res = kg.breadth_first_search("NonExistentNode", "Total Cholesterol")
    assert invalid_res.distance == -1
    assert invalid_res.path == []


def test_exp2_dfs_traversal_and_cycles():
    kg = MedicalKnowledgeGraph()

    # DFS from Metabolic System to HbA1c
    res = kg.depth_first_search("Metabolic System", "HbA1c")
    assert res.start_node == "Metabolic System"
    assert res.target_node == "HbA1c"
    assert len(res.path) >= 3
    assert res.path[0] == "Metabolic System"
    assert res.path[-1] == "HbA1c"
    assert res.max_depth > 0

    # DFS without target (full traversal exploration)
    full_res = kg.depth_first_search("Hematology")
    assert full_res.visited_count >= 5
    assert "CBC" in full_res.visited_order


# ==============================================================================
# 3. Experiment 3: Informed Search (Greedy Best-First & A*)
# ==============================================================================
def test_exp3_a_star_optimality():
    router = MedicalSearchRouter()

    # A* from Patient Intake to HbA1c
    res = router.a_star_search("Patient Intake", "HbA1c")
    assert res.algorithm == "A*"
    assert res.success is True
    assert res.path[0] == "Patient Intake"
    assert res.path[-1] == "HbA1c"
    assert res.total_cost > 0.0
    assert res.nodes_expanded > 0

    # Verify start equals target
    same_res = router.a_star_search("Patient Intake", "Patient Intake")
    assert same_res.success is True
    assert same_res.path == ["Patient Intake"]
    assert same_res.total_cost == 0.0

    # Verify unreachable target
    unreach_res = router.a_star_search("Blood Urea Nitrogen", "Patient Intake")
    assert unreach_res.success is False
    assert unreach_res.path == []


def test_exp3_greedy_best_first():
    router = MedicalSearchRouter()

    res = router.greedy_best_first_search("Patient Intake", "Serum Creatinine")
    assert res.algorithm == "Greedy Best-First"
    assert res.success is True
    assert res.path[0] == "Patient Intake"
    assert res.path[-1] == "Serum Creatinine"
    assert res.total_cost > 0.0


# ==============================================================================
# 4. Experiment 4: Local Search Optimization
# ==============================================================================
def test_exp4_hill_climbing():
    optimizer = ParameterOptimizer(seed=42)

    # Minimize sphere objective: f(x) = x0^2 + x1^2 starting from [5.0, 5.0]
    init = [5.0, 5.0]
    res = optimizer.hill_climbing(init, objective_fn=optimizer.sphere_objective, max_iterations=200)

    assert res.algorithm == "Hill Climbing"
    assert res.best_score < res.initial_score
    assert res.best_score < 0.1  # Converged close to minimum (0.0)
    assert len(res.history) > 1


def test_exp4_simulated_annealing():
    optimizer = ParameterOptimizer(seed=42)

    init = [1.5, -1.5]
    res = optimizer.simulated_annealing(
        init,
        objective_fn=optimizer.sphere_objective,
        initial_temp=20.0,
        cooling_rate=0.97,
        max_iterations=600,
        step_size=0.2,
    )

    assert res.algorithm == "Simulated Annealing"
    assert res.best_score < res.initial_score
    assert res.best_score < 0.2
    assert res.acceptance_rate is not None
    assert res.temperature_final < 1.0


# ==============================================================================
# 5. Experiment 5: Rule Engine (Forward & Backward Chaining)
# ==============================================================================
def test_exp5_forward_chaining():
    engine = RuleEngine()

    # Given low hemoglobin, low MCV, and low ferritin
    facts = {
        "hemoglobin_low": True,
        "mcv_low": True,
        "ferritin_low": True,
    }

    res = engine.forward_chain(facts)
    assert res.mode == "forward"
    assert res.success is True

    derived_names = [f["fact"] for f in res.derived_facts]
    assert "microcytic_pattern" in derived_names
    assert "iron_deficiency_pattern" in derived_names
    assert "R1_ANEMIA_SUSPICION" in res.fired_rules
    assert "R2_IRON_CORRELATION" in res.fired_rules
    assert len(res.trace) > 0


def test_exp5_backward_chaining():
    engine = RuleEngine()

    # Prove iron_deficiency_pattern == True
    facts = {
        "hemoglobin_low": True,
        "mcv_low": True,
        "ferritin_low": True,
    }

    res = engine.backward_chain("iron_deficiency_pattern", True, facts)
    assert res.mode == "backward"
    assert res.success is True
    assert "R2_IRON_CORRELATION" in res.fired_rules

    # Unprovable goal test
    unproven = engine.backward_chain("renal_filtration_attention", True, facts)
    assert unproven.success is False
    assert len(unproven.missing_facts) > 0


# ==============================================================================
# 6. Experiment 6: Linear Regression
# ==============================================================================
def test_exp6_linear_regression():
    svc = TrendRegressionService()

    # Generate linear synthetic data with known slope=2.0, intercept=5.0
    X, y = svc.generate_synthetic_benchmark(n_samples=80, slope=2.0, intercept=5.0, noise_std=0.2, seed=42)
    res = svc.train_and_evaluate(X, y, test_size=0.25)

    assert abs(res.slope - 2.0) < 0.2
    assert abs(res.intercept - 5.0) < 0.5
    assert res.r2 > 0.95
    assert res.mae < 0.5
    assert res.rmse < 0.5
    assert res.trend_direction == "increasing"
    assert len(res.predictions) > 0

    # Error handling for insufficient points
    with pytest.raises(ValueError, match="Insufficient samples"):
        svc.train_and_evaluate(np.array([1.0, 2.0]), np.array([10.0, 20.0]))


# ==============================================================================
# 7. Experiment 7: KNN and Decision Trees
# ==============================================================================
def test_exp7_knn_classifier():
    clf_svc = HealthPatternClassifier()
    X, y, _ = clf_svc.generate_synthetic_benchmark(n_samples=150, seed=42)

    res = clf_svc.train_knn(X, y, n_neighbors=5, test_size=0.3)
    assert "k-Nearest Neighbors" in res.model_name
    assert res.accuracy > 0.70
    assert res.f1 > 0.65
    assert len(res.confusion_matrix) == 2
    assert len(res.sample_predictions) > 0


def test_exp7_decision_tree_classifier():
    clf_svc = HealthPatternClassifier()
    X, y, names = clf_svc.generate_synthetic_benchmark(n_samples=150, seed=42)

    res = clf_svc.train_decision_tree(X, y, max_depth=3, test_size=0.3, feature_names=names)
    assert "Decision Tree" in res.model_name
    assert res.accuracy > 0.70
    assert res.explanation_tree is not None
    assert "Glucose Index" in res.explanation_tree or "Lipid Ratio" in res.explanation_tree


# ==============================================================================
# 8. Experiment 8: K-Means Clustering
# ==============================================================================
def test_exp8_kmeans_clustering():
    cluster_svc = CohortClusterService()
    X, names = cluster_svc.generate_synthetic_cohort(n_samples=120, n_clusters=3, seed=42)

    res = cluster_svc.fit_clusters(X, n_clusters=3, feature_names=names, seed=42)
    assert res.n_clusters == 3
    assert res.n_samples == 120
    assert res.n_features == 3
    assert res.inertia > 0.0
    assert len(res.cluster_profiles) == 3

    total_pct = sum(p.percentage for p in res.cluster_profiles)
    assert abs(total_pct - 100.0) < 1.0
    assert len(res.cluster_profiles[0].centroid_original) == 3


# ==============================================================================
# 9. Experiment 9: Clinical NLP Engine
# ==============================================================================
def test_exp9_nlp_tokenization_and_entities():
    nlp = ClinicalNLPEngine()

    text = "Patient lab results show Fasting Glucose of 115 mg/dL and Hemoglobin of 11.2 g/dL."
    tokens = nlp.tokenize(text)
    assert len(tokens) > 10

    biomarkers, units = nlp.extract_clinical_entities(text)
    assert "Glucose" in biomarkers
    assert "Hemoglobin" in biomarkers
    assert "mg/dl" in units
    assert "g/dl" in units


def test_exp9_query_intent_and_grounded_prompt():
    nlp = ClinicalNLPEngine()

    # Intent classification
    q1 = "What is the normal reference range for platelets?"
    assert nlp.classify_query_intent(q1) == "range_query"

    q2 = "Is my fasting glucose improving compared to last report?"
    assert nlp.classify_query_intent(q2) == "trend_inquiry"

    q3 = "Why are my liver enzymes high?"
    assert nlp.classify_query_intent(q3) == "explanation"

    # Grounded prompt construction
    params = [
        {"name": "Hemoglobin", "value": 11.5, "unit": "g/dL", "reference_range": "12.0 - 17.5", "status": "low"}
    ]
    res = nlp.build_grounded_assistant_prompt(
        user_question="Can you explain my hemoglobin?",
        verified_parameters=params,
        detected_conditions=["Mild Microcytic Profile"],
    )

    assert "Hemoglobin: 11.5 g/dL" in res.grounded_context_prompt
    assert "Mild Microcytic Profile" in res.grounded_context_prompt
    assert "DO NOT INVENT OTHER MEASUREMENTS" in res.grounded_context_prompt
    assert res.query_intent == "explanation"


def test_exp1_matplotlib_distribution_plot():
    svc = DataFoundationService()
    # Test valid biomarker list produces clean base64 Matplotlib image
    values = [85.0, 92.0, 88.0, 110.0, 95.0, 99.0, 102.0]
    plot_b64 = svc.generate_distribution_plot_base64("Fasting Glucose", values, unit="mg/dL")
    assert plot_b64 is not None
    assert plot_b64.startswith("data:image/png;base64,")

    # Edge case: single value returns None
    assert svc.generate_distribution_plot_base64("Single", [95.0]) is None


def test_exp2_symptom_followup_traversal():
    kg = MedicalKnowledgeGraph()
    # Test traversing from Biomarker -> Concern -> Follow-up
    res = kg.breadth_first_search("Fasting Glucose", "Fasting Re-test & Nutritional Counseling")
    assert res.start_node == "Fasting Glucose"
    assert res.target_node == "Fasting Re-test & Nutritional Counseling"
    assert "Glycemic Dysregulation Concern" in res.path
    assert res.distance == 2
