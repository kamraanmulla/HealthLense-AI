"""
HealthLens AI — Insights & Advanced Analytics API Router
=========================================================
Exposes verified data processing, knowledge graph exploration, pathway routing,
transparent rule logic traces, descriptive trend analysis, and benchmark modeling.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.models.report import Report, ReportParameter
from app.models.user import User
from app.schemas.insights import (
    ClusterExplorationResponse,
    ClusterGroupProfile,
    CohortClassifyRequest,
    CohortClassifyResponse,
    ConceptExploreResponse,
    LogicEvaluationRequest,
    LogicEvaluationResponse,
    MetricTrajectoryResponse,
    NLPAnalysisRequest,
    NLPAnalysisResponse,
    OptimizationBenchmarkRequest,
    OptimizationBenchmarkResponse,
    PathwaySearchResponse,
)

# AI / Computational Experiment Engines
from app.experiments.exp1_data_foundation import DataFoundationService
from app.experiments.exp2_graph_traversal import MedicalKnowledgeGraph
from app.experiments.exp3_informed_search import MedicalSearchRouter
from app.experiments.exp4_local_search import ParameterOptimizer
from app.experiments.exp5_rule_engine import RuleEngine
from app.experiments.exp6_regression import TrendRegressionService
from app.experiments.exp7_classification import HealthPatternClassifier
from app.experiments.exp8_clustering import CohortClusterService
from app.experiments.exp9_nlp_engine import ClinicalNLPEngine

router = APIRouter()


# ── 1. Knowledge Network Explorer (Exp 2: BFS & DFS) ───────────────────────────
@router.get(
    "/knowledge-graph/explore",
    response_model=ConceptExploreResponse,
    summary="Explore connected clinical concepts and biomarker ontology",
    description="Traverses non-diagnostic relationships across organ systems, panels, and biomarkers.",
)
def explore_knowledge_graph(
    concept: Optional[str] = Query("Cardiovascular", description="Starting biomarker or organ system concept"),
    target: Optional[str] = Query(None, description="Optional target concept to find an informational pathway to"),
    mode: str = Query("breadth", description="'breadth' (shortest link) or 'depth' (thematic branch)"),
    report_id: Optional[str] = Query(None, description="Optional report ID to auto-populate concept from report findings"),
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> ConceptExploreResponse:
    kg = MedicalKnowledgeGraph()

    start_concept = concept or "Cardiovascular"

    # If report_id supplied, inspect user's report to find associated biomarker concept
    if report_id:
        report = (
            db.query(Report)
            .filter(Report.id == report_id, Report.user_id == current_user.id, Report.is_deleted == False)
            .first()
        )
        if report and (not concept or concept.strip() in ("", "Cardiovascular")):
            # Check abnormal parameters first
            for p in report.parameters:
                if p.status != "normal":
                    mapped = kg.map_parameter_to_concept(p.name)
                    if mapped:
                        start_concept = mapped
                        break
            # Fallback to any parameter if no abnormal mapped
            if start_concept == "Cardiovascular" and report.parameters:
                for p in report.parameters:
                    mapped = kg.map_parameter_to_concept(p.name)
                    if mapped:
                        start_concept = mapped
                        break

    if mode.lower() == "depth":
        dfs_res = kg.depth_first_search(start_concept, target)
        path = dfs_res.path
        visited_count = dfs_res.visited_count
        distance = len(path) - 1 if path else -1
        structure = [{"node": n, "order": i} for i, n in enumerate(dfs_res.visited_order[:20])]
    else:
        bfs_res = kg.breadth_first_search(start_concept, target)
        path = bfs_res.path
        visited_count = bfs_res.visited_count
        distance = bfs_res.distance
        structure = bfs_res.traversal_tree[:25]

    return ConceptExploreResponse(
        start_concept=start_concept,
        target_concept=target,
        traversal_mode=mode,
        connected_path=path,
        distance_hops=max(distance, 0),
        concepts_visited=visited_count,
        network_structure=structure,
        educational_disclaimer=(
            "Graph connectivity represents informational and educational affinity within clinical ontology. "
            "It does not establish medical causality, clinical diagnosis, or treatment decisions."
        ),
    )


# ── 2. Pathway Navigation Router (Exp 3: Greedy BFS & A*) ──────────────────────
@router.get(
    "/search/pathway",
    response_model=PathwaySearchResponse,
    summary="Compute structured biomarker navigation pathway",
    description="Calculates panel and marker navigation routes using transition complexity heuristics.",
)
def navigate_biomarker_pathway(
    start_panel: str = Query("Patient Intake", description="Starting panel or clinical intake stage"),
    target_marker: str = Query("Serum Creatinine", description="Target laboratory biomarker"),
    strategy: str = Query("optimal", description="'optimal' (cost-balanced) or 'directed' (heuristic-driven)"),
    current_user: User = Depends(get_active_user),
) -> PathwaySearchResponse:
    router_svc = MedicalSearchRouter()

    if strategy.lower() == "directed":
        res = router_svc.greedy_best_first_search(start_panel, target_marker)
    else:
        res = router_svc.a_star_search(start_panel, target_marker)

    return PathwaySearchResponse(
        strategy=strategy,
        start_panel=start_panel,
        target_marker=target_marker,
        path=res.path,
        total_transition_cost=res.total_cost,
        stages_evaluated=res.nodes_expanded,
        path_found=res.success,
        educational_disclaimer=(
            "Pathway navigation illustrates computational routing across laboratory workflows. "
            "It is purely informational and does not define clinical order of testing."
        ),
    )


# ── 3. Parameter Optimizer Benchmark (Exp 4: Local Search) ─────────────────────
@router.post(
    "/optimization/benchmark",
    response_model=OptimizationBenchmarkResponse,
    summary="Execute parameter calibration benchmark",
    description="Runs local-search optimization on synthetic technical calibration benchmarks.",
)
def run_optimization_benchmark(
    payload: OptimizationBenchmarkRequest,
    current_user: User = Depends(get_active_user),
) -> OptimizationBenchmarkResponse:
    optimizer = ParameterOptimizer(seed=42)

    init_state = payload.initial_values if len(payload.initial_values) >= 2 else [1.5, -1.5]

    if payload.algorithm_type.lower() == "climbing":
        res = optimizer.hill_climbing(
            init_state,
            objective_fn=optimizer.synthetic_sensor_calibration_loss,
            max_iterations=payload.max_steps,
        )
    else:
        res = optimizer.simulated_annealing(
            init_state,
            objective_fn=optimizer.synthetic_sensor_calibration_loss,
            max_iterations=payload.max_steps,
            step_size=0.25,
        )

    # Downsample history if large for light JSON response
    sample_stride = max(1, len(res.history) // 30)
    sampled_history = [round(v, 4) for v in res.history[::sample_stride]]

    return OptimizationBenchmarkResponse(
        optimizer_type=res.algorithm,
        calibrated_parameters=res.best_state,
        final_objective_score=res.best_score,
        initial_score=res.initial_score,
        steps_taken=res.iterations,
        convergence_profile=sampled_history,
        technical_note=(
            "Local search optimization is executed on an isolated technical curve calibration benchmark. "
            "It is completely decoupled from and never modifies clinical scoring rules or patient reference ranges."
        ),
    )


# ── 4. Transparent Logic Explanation Traces (Exp 5: Rule Engine) ───────────────
@router.post(
    "/logic/explain",
    response_model=LogicEvaluationResponse,
    summary="Generate transparent, traceable rule explanations",
    description="Evaluates active clinical parameters against explicit rules with full audit proof traces.",
)
def explain_health_logic(
    payload: LogicEvaluationRequest,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> LogicEvaluationResponse:
    engine = RuleEngine()
    facts: Dict[str, Any] = {}
    evaluated_report_id = payload.report_id

    # If user provided a report_id, extract verified parameters belonging to this user
    if payload.report_id:
        report = (
            db.query(Report)
            .filter(
                Report.id == payload.report_id,
                Report.user_id == current_user.id,
                Report.is_deleted == False,
            )
            .first()
        )
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found or access unauthorized.",
            )

        for param in report.parameters:
            p_name = param.name.lower().strip()
            if param.status == "low":
                if "hemo" in p_name:
                    facts["hemoglobin_low"] = True
                elif "mcv" in p_name:
                    facts["mcv_low"] = True
                elif "ferritin" in p_name:
                    facts["ferritin_low"] = True
                elif "hdl" in p_name:
                    facts["hdl_low"] = True
            elif param.status == "high":
                if "glucose" in p_name:
                    facts["glucose_fasting_high"] = True
                elif "hba1c" in p_name:
                    facts["hba1c_high"] = True
                elif "creatinine" in p_name:
                    facts["creatinine_high"] = True
                elif "urea" in p_name or "bun" in p_name:
                    facts["bun_high"] = True
                elif "ldl" in p_name:
                    facts["ldl_high"] = True

    elif not payload.custom_facts:
        # Default to user's latest completed report if no custom facts provided
        latest_report = (
            db.query(Report)
            .filter(
                Report.user_id == current_user.id,
                Report.is_deleted == False,
                Report.status == "completed",
            )
            .order_by(Report.created_at.desc())
            .first()
        )
        if latest_report:
            evaluated_report_id = str(latest_report.id)
            for param in latest_report.parameters:
                p_name = param.name.lower().strip()
                if param.status == "low":
                    if "hemo" in p_name:
                        facts["hemoglobin_low"] = True
                    elif "mcv" in p_name:
                        facts["mcv_low"] = True
                    elif "ferritin" in p_name:
                        facts["ferritin_low"] = True
                    elif "hdl" in p_name:
                        facts["hdl_low"] = True
                elif param.status == "high":
                    if "glucose" in p_name:
                        facts["glucose_fasting_high"] = True
                    elif "hba1c" in p_name:
                        facts["hba1c_high"] = True
                    elif "creatinine" in p_name:
                        facts["creatinine_high"] = True
                    elif "urea" in p_name or "bun" in p_name:
                        facts["bun_high"] = True
                    elif "ldl" in p_name:
                        facts["ldl_high"] = True

    # Incorporate any custom user facts provided
    if payload.custom_facts:
        facts.update(payload.custom_facts)

    if not facts:
        # Genuine insufficient-data state: ZERO fabricated fallback facts
        return LogicEvaluationResponse(
            mode="Data-Driven Findings Deduction",
            hypothesis=payload.hypothesis_goal,
            hypothesis_confirmed=False,
            findings_explained=[],
            rules_applied=[],
            transparent_audit_trace=[
                "Checked user report parameters and submitted facts.",
                "No active laboratory abnormalities found matching clinical rule antecedents.",
            ],
            missing_information=[],
            educational_summary=(
                "No abnormal laboratory findings are present in the evaluated report. "
                "All parameters fall within standard laboratory reference ranges, so no warning rules were fired."
            ),
            has_sufficient_data=False,
            insufficient_reason="No abnormal parameters available to trigger rule engine inferences.",
            report_id_evaluated=evaluated_report_id,
        )

    if payload.hypothesis_goal:
        res = engine.backward_chain(payload.hypothesis_goal, True, facts)
        mode_label = "Goal-Directed Hypothesis Verification"
    else:
        res = engine.forward_chain(facts)
        mode_label = "Data-Driven Findings Deduction"

    return LogicEvaluationResponse(
        mode=mode_label,
        hypothesis=payload.hypothesis_goal,
        hypothesis_confirmed=res.success if payload.hypothesis_goal else (len(res.fired_rules) > 0),
        findings_explained=res.derived_facts,
        rules_applied=res.fired_rules,
        transparent_audit_trace=res.trace,
        missing_information=res.missing_facts,
        educational_summary=(
            f"Derived {len(res.derived_facts)} verified inferences across {len(res.fired_rules)} transparent rules. "
            "All findings are deterministically traceable to active laboratory indicators."
        ),
        has_sufficient_data=True,
        insufficient_reason=None,
        report_id_evaluated=evaluated_report_id,
    )


# ── 5. Descriptive Metric Trajectory & Foundation (Exp 6 & Exp 1) ──────────────
@router.get(
    "/trends/trajectory/{parameter}",
    response_model=MetricTrajectoryResponse,
    summary="Compute descriptive longitudinal trajectory and statistics",
    description="Uses NumPy, Pandas, and linear trend analysis over the authenticated user's historical reports.",
)
def get_metric_trajectory(
    parameter: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> MetricTrajectoryResponse:
    # 1. Fetch only reports belonging to the current user
    user_reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id, Report.is_deleted == False, Report.status == "completed")
        .order_by(Report.created_at.asc())
        .all()
    )

    report_ids = [r.id for r in user_reports]
    raw_measurements: List[Dict[str, Any]] = []

    if report_ids:
        param_rows = (
            db.query(ReportParameter, Report.created_at)
            .join(Report, Report.id == ReportParameter.report_id)
            .filter(ReportParameter.report_id.in_(report_ids))
            .all()
        )

        param_clean = parameter.strip().lower()
        for p, created_at in param_rows:
            if param_clean in p.name.lower():
                raw_measurements.append({
                    "date": created_at.isoformat() if created_at else None,
                    "name": p.name,
                    "value": p.value,
                    "unit": p.unit,
                    "status": p.status,
                })

    data_foundation = DataFoundationService()
    df, audit = data_foundation.validate_and_clean_measurements(raw_measurements)

    valid_vals = df[df["is_valid"]]["normalized_value"].dropna().tolist() if not df.empty else []
    stats = data_foundation.compute_descriptive_statistics(valid_vals)

    trajectory_info: Optional[Dict[str, Any]] = None
    insufficient_reason: Optional[str] = None
    fitted_points: Optional[List[Dict[str, float]]] = None

    if len(valid_vals) >= 4:
        reg_service = TrendRegressionService()
        hist_for_reg = df[df["is_valid"]].to_dict(orient="records")
        reg_res = reg_service.fit_longitudinal_trajectory(hist_for_reg)
        if reg_res:
            trajectory_info = {
                "slope": reg_res.slope,
                "intercept": reg_res.intercept,
                "r2_score": reg_res.r2,
                "mae": reg_res.mae,
                "rmse": reg_res.rmse,
                "direction": reg_res.trend_direction,
                "note": reg_res.educational_note,
            }
            fitted_points = reg_res.fitted_line
    else:
        insufficient_reason = (
            f"Linear trend regression requires at least 4 dated observations of '{parameter}' "
            f"(found {len(valid_vals)}). As you upload more historical reports, linear trajectory modeling will automatically calibrate."
        )

    data_points = df.to_dict(orient="records") if not df.empty else []

    return MetricTrajectoryResponse(
        parameter_name=parameter,
        total_observations=len(raw_measurements),
        data_quality_score=audit.get("data_quality_score", 0.0),
        missing_rate=audit.get("missing_rate", 0.0),
        descriptive_statistics=stats,
        trajectory=trajectory_info,
        data_points=data_points[:50],
        educational_disclaimer=(
            "Trajectory analysis provides descriptive mathematical curve fitting over past user data points. "
            "It does not forecast future health outcomes or clinical disease progression."
        ),
        insufficient_data_reason=insufficient_reason,
        fitted_points=fitted_points,
    )


# ── 6. Cohort Similarity Benchmark (Exp 7: KNN & Decision Trees) ───────────────
@router.post(
    "/cohort/classify",
    response_model=CohortClassifyResponse,
    summary="Evaluate multi-marker similarity pattern on synthetic cohort",
    description="Demonstrates classification metrics and explainable decision paths on benchmark cohorts.",
)
def classify_cohort_pattern(
    payload: CohortClassifyRequest,
    current_user: User = Depends(get_active_user),
) -> CohortClassifyResponse:
    clf_svc = HealthPatternClassifier()
    X, y, feature_names = clf_svc.generate_synthetic_benchmark(n_samples=payload.sample_size, seed=42)

    if payload.classifier_type.lower() == "knn":
        res = clf_svc.train_knn(X, y, n_neighbors=5)
    else:
        res = clf_svc.train_decision_tree(X, y, max_depth=3, feature_names=feature_names)

    return CohortClassifyResponse(
        classifier=res.model_name,
        accuracy_score=res.accuracy,
        precision_score=res.precision,
        recall_score=res.recall,
        f1_score=res.f1,
        confusion_matrix=res.confusion_matrix,
        evaluation_samples=res.test_samples,
        transparent_decision_rules=res.explanation_tree,
        educational_disclaimer=res.educational_disclaimer,
    )


# ── 7. Biomarker Cohort Clustering (Exp 8: K-Means) ────────────────────────────
@router.get(
    "/clustering/cohorts",
    response_model=ClusterExplorationResponse,
    summary="Explore multi-variable biomarker cluster distributions",
    description="Partitions user report biomarkers (or educational benchmark) into geometric clusters with centroid profiles.",
)
def explore_cohort_clustering(
    clusters: int = Query(3, ge=2, le=6, description="Number of statistical clusters (k)"),
    source: str = Query("user", description="'user' for authenticated user reports, 'demo' for synthetic benchmark"),
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> ClusterExplorationResponse:
    cluster_svc = CohortClusterService()

    if source.lower() == "demo":
        X, feature_names = cluster_svc.generate_synthetic_cohort(n_samples=180, n_clusters=clusters, seed=42)
        res = cluster_svc.fit_clusters(X, n_clusters=clusters, feature_names=feature_names, seed=42)
        profiles = [
            ClusterGroupProfile(
                group_id=p.cluster_id,
                sample_count=p.size,
                cohort_share_pct=p.percentage,
                biomarker_centroids=p.centroid_original,
            )
            for p in res.cluster_profiles
        ]
        return ClusterExplorationResponse(
            group_count=res.n_clusters,
            total_cohort_samples=res.n_samples,
            biomarker_names=res.feature_names,
            cohesion_inertia=res.inertia,
            cohort_profiles=profiles,
            educational_disclaimer=(
                "EDUCATIONAL DEMO BENCHMARK: Synthesized population simulation for statistical demonstration. "
                "Not derived from your medical records."
            ),
            is_synthetic=True,
            has_sufficient_data=True,
            insufficient_reason=None,
            scatter_points=res.scatter_points,
            feature_x_label=res.feature_x_label,
            feature_y_label=res.feature_y_label,
            pca_applied=res.pca_applied,
            pca_explained_variance=res.pca_explained_variance,
        )

    # Scoped strictly to current_user
    user_reports = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id,
            Report.is_deleted == False,
            Report.status == "completed",
        )
        .order_by(Report.created_at.asc())
        .all()
    )

    X, feature_names, sample_labels, error_msg = cluster_svc.build_user_observation_matrix(
        user_reports, min_clusters=clusters
    )

    if error_msg or X is None:
        return ClusterExplorationResponse(
            group_count=0,
            total_cohort_samples=len(user_reports),
            biomarker_names=[],
            cohesion_inertia=0.0,
            cohort_profiles=[],
            educational_disclaimer=(
                "Clusters represent mathematical geometric proximity across multi-variable observations. "
                "They do not define clinical risk tiers or medical diagnoses."
            ),
            is_synthetic=False,
            has_sufficient_data=False,
            insufficient_reason=error_msg or "Insufficient report observations available.",
            scatter_points=[],
            feature_x_label="",
            feature_y_label="",
            pca_applied=False,
            pca_explained_variance=None,
        )

    res = cluster_svc.fit_clusters(
        X, n_clusters=clusters, feature_names=feature_names, sample_labels=sample_labels, seed=42
    )

    profiles = [
        ClusterGroupProfile(
            group_id=p.cluster_id,
            sample_count=p.size,
            cohort_share_pct=p.percentage,
            biomarker_centroids=p.centroid_original,
        )
        for p in res.cluster_profiles
    ]

    return ClusterExplorationResponse(
        group_count=res.n_clusters,
        total_cohort_samples=res.n_samples,
        biomarker_names=res.feature_names,
        cohesion_inertia=res.inertia,
        cohort_profiles=profiles,
        educational_disclaimer=(
            "User Observation Clusters represent statistical similarity groups across your actual medical reports. "
            "They do not represent disease states or clinical categories."
        ),
        is_synthetic=False,
        has_sufficient_data=True,
        insufficient_reason=None,
        scatter_points=res.scatter_points,
        feature_x_label=res.feature_x_label,
        feature_y_label=res.feature_y_label,
        pca_applied=res.pca_applied,
        pca_explained_variance=res.pca_explained_variance,
    )


# ── 8. Clinical NLP & Intent Analysis (Exp 9) ──────────────────────────────────
@router.post(
    "/nlp/analyze",
    response_model=NLPAnalysisResponse,
    summary="Analyze clinical query text, extract entities and intent, and synthesize grounded context",
    description="Uses the Clinical NLP Engine to tokenize, extract clinical entities, detect query intent, and bind prompts strictly to authenticated user report parameters.",
)
def analyze_clinical_nlp(
    payload: NLPAnalysisRequest,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> NLPAnalysisResponse:
    nlp = ClinicalNLPEngine()
    verified_params: List[Dict[str, Any]] = []
    detected_conditions: List[str] = []

    if payload.report_id:
        report = (
            db.query(Report)
            .filter(
                Report.id == payload.report_id,
                Report.user_id == current_user.id,
                Report.is_deleted == False,
            )
            .first()
        )
        if report:
            for p in report.parameters:
                verified_params.append({
                    "parameter_name": p.name,
                    "value": p.value,
                    "unit": p.unit,
                    "reference_range": p.reference_text or (f"{p.reference_min} - {p.reference_max}" if p.reference_min is not None else "N/A"),
                    "status": p.status,
                })
            if report.ai_result and isinstance(report.ai_result, dict):
                for c in report.ai_result.get("detected_conditions", []):
                    if isinstance(c, dict) and "condition" in c:
                        detected_conditions.append(c["condition"])

    nlp_result = nlp.build_grounded_assistant_prompt(
        user_question=payload.text,
        verified_parameters=verified_params,
        detected_conditions=detected_conditions,
    )

    return NLPAnalysisResponse(
        original_text=nlp_result.original_text,
        normalized_text=nlp_result.normalized_text,
        token_count=nlp_result.token_count,
        cleaned_tokens=nlp_result.cleaned_tokens,
        identified_biomarkers=nlp_result.identified_biomarkers,
        identified_units=nlp_result.identified_units,
        query_intent=nlp_result.query_intent,
        grounded_context_prompt=nlp_result.grounded_context_prompt,
        grounded_parameters_count=len(verified_params),
        educational_disclaimer=(
            "Natural Language Processing extracts clinical linguistic entities and intent without fabricating missing data. "
            "It does not replace clinical physician consultation."
        ),
    )
