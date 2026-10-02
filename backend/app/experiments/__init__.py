"""
HealthLens AI — Core AI & Computational Experiment Suite
=========================================================
Encapsulates real, production-ready implementations of the 9 foundational AI/ML
laboratory algorithms, engineered with strict separation between clinical patient safety
and educational/computational exploration.
"""

from app.experiments.exp1_data_foundation import DataFoundationService
from app.experiments.exp2_graph_traversal import MedicalKnowledgeGraph, BFSResult, DFSResult
from app.experiments.exp3_informed_search import MedicalSearchRouter, SearchResult
from app.experiments.exp4_local_search import ParameterOptimizer, OptimizationResult
from app.experiments.exp5_rule_engine import RuleEngine, InferenceResult, Fact, Rule
from app.experiments.exp6_regression import TrendRegressionService, RegressionResult
from app.experiments.exp7_classification import HealthPatternClassifier, ClassificationResult
from app.experiments.exp8_clustering import CohortClusterService, ClusteringResult
from app.experiments.exp9_nlp_engine import ClinicalNLPEngine, NLPAnalysisResult

__all__ = [
    "DataFoundationService",
    "MedicalKnowledgeGraph",
    "BFSResult",
    "DFSResult",
    "MedicalSearchRouter",
    "SearchResult",
    "ParameterOptimizer",
    "OptimizationResult",
    "RuleEngine",
    "InferenceResult",
    "Fact",
    "Rule",
    "TrendRegressionService",
    "RegressionResult",
    "HealthPatternClassifier",
    "ClassificationResult",
    "CohortClusterService",
    "ClusteringResult",
    "ClinicalNLPEngine",
    "NLPAnalysisResult",
]
