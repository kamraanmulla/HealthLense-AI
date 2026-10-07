"""
HealthLens AI — Schemas for Educational Health Insights and Computational Analytics
==================================================================================
Defines request and response models for non-diagnostic knowledge exploration,
metric trajectory estimation, rule logic traces, and benchmark demonstrations.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── 1. Knowledge Network (Exp 2 BFS/DFS) ───────────────────────────────────────
class ConceptExploreRequest(BaseModel):
    node: str = Field(..., description="Biomarker or organ system concept to explore")
    target: Optional[str] = Field(None, description="Optional target concept to find connection to")
    traversal_mode: str = Field("breadth", description="'breadth' (shortest path) or 'depth' (thematic branch)")


class ConceptExploreResponse(BaseModel):
    start_concept: str
    target_concept: Optional[str] = None
    traversal_mode: str
    connected_path: List[str]
    distance_hops: int
    concepts_visited: int
    network_structure: List[Dict[str, Any]]
    educational_disclaimer: str


# ── 2. Pathway Navigation (Exp 3 Informed Search) ──────────────────────────────
class PathwaySearchRequest(BaseModel):
    start_panel: str = Field(..., description="Starting lab panel or intake stage")
    target_marker: str = Field(..., description="Target biomarker")
    routing_strategy: str = Field("optimal", description="'optimal' (A*) or 'directed' (Greedy Best-First)")


class PathwaySearchResponse(BaseModel):
    strategy: str
    start_panel: str
    target_marker: str
    path: List[str]
    total_transition_cost: float
    stages_evaluated: int
    path_found: bool
    educational_disclaimer: str


# ── 3. Parameter Optimizer Benchmark (Exp 4 Local Search) ──────────────────────
class OptimizationBenchmarkRequest(BaseModel):
    algorithm_type: str = Field("annealing", description="'annealing' (Simulated Annealing) or 'climbing' (Hill Climbing)")
    initial_values: List[float] = Field(default_factory=lambda: [1.5, -1.5])
    max_steps: int = Field(300, ge=10, le=1000)


class OptimizationBenchmarkResponse(BaseModel):
    optimizer_type: str
    calibrated_parameters: List[float]
    final_objective_score: float
    initial_score: float
    steps_taken: int
    convergence_profile: List[float]
    technical_note: str


# ── 4. Transparent Logic Traces (Exp 5 Rule Engine) ───────────────────────────
class LogicEvaluationRequest(BaseModel):
    report_id: Optional[str] = Field(None, description="Optional user report ID to load verified parameters from")
    custom_facts: Optional[Dict[str, Any]] = Field(None, description="Optional direct key-value fact assertions")
    hypothesis_goal: Optional[str] = Field(None, description="Optional hypothesis to prove via backward reasoning")


class LogicEvaluationResponse(BaseModel):
    mode: str
    hypothesis: Optional[str] = None
    hypothesis_confirmed: bool
    findings_explained: List[Dict[str, Any]]
    rules_applied: List[str]
    transparent_audit_trace: List[str]
    missing_information: List[str]
    educational_summary: str
    has_sufficient_data: bool = True
    insufficient_reason: Optional[str] = None
    report_id_evaluated: Optional[str] = None


# ── 5. Metric Trajectory & Data Foundation (Exp 6 + Exp 1) ─────────────────────
class MetricTrajectoryResponse(BaseModel):
    parameter_name: str
    total_observations: int
    data_quality_score: float
    missing_rate: float
    descriptive_statistics: Dict[str, Optional[float]]
    trajectory: Optional[Dict[str, Any]] = None
    data_points: List[Dict[str, Any]]
    educational_disclaimer: str
    insufficient_data_reason: Optional[str] = None
    fitted_points: Optional[List[Dict[str, float]]] = None
    matplotlib_plot_base64: Optional[str] = None


# ── 6. Cohort Similarity Benchmark (Exp 7 Classification) ─────────────────────
class CohortClassifyRequest(BaseModel):
    classifier_type: str = Field("tree", description="'tree' (Decision Tree) or 'knn' (k-Nearest Neighbors)")
    sample_size: int = Field(200, ge=50, le=500)


class CohortClassifyResponse(BaseModel):
    classifier: str
    accuracy_score: float
    precision_score: float
    recall_score: float
    f1_score: float
    confusion_matrix: List[List[int]]
    evaluation_samples: int
    transparent_decision_rules: Optional[str] = None
    educational_disclaimer: str


# ── 7. Metric Clustering (Exp 8 K-Means) ──────────────────────────────────────
class ClusterGroupProfile(BaseModel):
    group_id: int
    sample_count: int
    cohort_share_pct: float
    biomarker_centroids: List[float]


class ClusterExplorationResponse(BaseModel):
    group_count: int
    total_cohort_samples: int
    biomarker_names: List[str]
    cohesion_inertia: float
    cohort_profiles: List[ClusterGroupProfile]
    educational_disclaimer: str
    is_synthetic: bool = False
    has_sufficient_data: bool = True
    insufficient_reason: Optional[str] = None
    scatter_points: List[Dict[str, Any]] = Field(default_factory=list)
    feature_x_label: str = ""
    feature_y_label: str = ""
    pca_applied: bool = False
    pca_explained_variance: Optional[List[float]] = None


# ── 8. NLP Clinical Entity & Intent Analysis (Exp 9) ───────────────────────────
class NLPAnalysisRequest(BaseModel):
    text: str = Field(..., description="Query or report text to analyze")
    report_id: Optional[str] = Field(None, description="Optional report ID to ground against")


class NLPAnalysisResponse(BaseModel):
    original_text: str
    normalized_text: str
    token_count: int
    cleaned_tokens: List[str]
    identified_biomarkers: List[str]
    identified_units: List[str]
    query_intent: str
    grounded_context_prompt: str
    grounded_parameters_count: int
    educational_disclaimer: str
