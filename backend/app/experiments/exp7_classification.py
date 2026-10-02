"""
Experiment 7: Supervised Classification (k-Nearest Neighbors & Decision Trees)
=============================================================================
Implements real classification models using scikit-learn:
- Feature preprocessing and z-score standard scaling for KNN
- Train/test splitting with stratification
- k-Nearest Neighbors (KNN) classifier with Euclidean distance metric
- Decision Tree classifier with Gini impurity and explainable split paths
- Full performance evaluation: Confusion Matrix, Accuracy, Precision, Recall, and F1-score
- SAFETY: Strictly used for computational benchmarking and data-driven similarity.
  NEVER applied to diagnose individual patients or classify disease presence.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier, export_text


@dataclass
class ClassificationResult:
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    confusion_matrix: List[List[int]]
    train_samples: int
    test_samples: int
    feature_count: int
    sample_predictions: List[Dict[str, Any]]
    explanation_tree: Optional[str] = None
    educational_disclaimer: str = (
        "Classification metrics reflect mathematical model behavior on synthetic benchmark data. "
        "Outputs are purely educational and are never used as medical diagnosis or clinical risk."
    )


class HealthPatternClassifier:
    """
    Classifier service for non-clinical demographic/biomarker pattern benchmarking.
    """

    @staticmethod
    def generate_synthetic_benchmark(
        n_samples: int = 250, n_features: int = 4, seed: int = 42
    ) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Generates synthetic multi-biomarker feature arrays:
        Features: [Glucose Proxy, Cholesterol Ratio, BMI Proxy, Systolic Proxy].
        Target: Binary metabolic subgroup (0 or 1).
        """
        X, y = make_classification(
            n_samples=n_samples,
            n_features=n_features,
            n_informative=3,
            n_redundant=1,
            n_classes=2,
            weights=[0.6, 0.4],
            random_state=seed,
        )
        feature_names = ["Glucose Index", "Lipid Ratio", "BMI Scale", "Pressure Index"]
        return X, y, feature_names

    def train_knn(
        self,
        X: np.ndarray,
        y: np.ndarray,
        n_neighbors: int = 5,
        test_size: float = 0.25,
        seed: int = 42,
    ) -> ClassificationResult:
        """
        Fits and evaluates a k-Nearest Neighbors classifier with StandardScaler.
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=seed, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        knn = KNeighborsClassifier(n_neighbors=n_neighbors, metric="euclidean")
        knn.fit(X_train_scaled, y_train)

        y_pred = knn.predict(X_test_scaled)

        cm = confusion_matrix(y_test, y_pred).tolist()
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        sample_preds = [
            {"actual": int(act), "predicted": int(prd), "match": bool(act == prd)}
            for act, prd in zip(y_test[:8], y_pred[:8])
        ]

        return ClassificationResult(
            model_name=f"k-Nearest Neighbors (k={n_neighbors})",
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1=round(f1, 4),
            confusion_matrix=cm,
            train_samples=len(X_train),
            test_samples=len(X_test),
            feature_count=X.shape[1],
            sample_predictions=sample_preds,
        )

    def train_decision_tree(
        self,
        X: np.ndarray,
        y: np.ndarray,
        max_depth: int = 3,
        test_size: float = 0.25,
        seed: int = 42,
        feature_names: Optional[List[str]] = None,
    ) -> ClassificationResult:
        """
        Fits and evaluates an interpretable Decision Tree classifier with legible decision paths.
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=seed, stratify=y
        )

        tree = DecisionTreeClassifier(max_depth=max_depth, criterion="gini", random_state=seed)
        tree.fit(X_train, y_train)

        y_pred = tree.predict(X_test)

        cm = confusion_matrix(y_test, y_pred).tolist()
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        names = feature_names or [f"Feature_{i}" for i in range(X.shape[1])]
        tree_text = export_text(tree, feature_names=names)

        sample_preds = [
            {"actual": int(act), "predicted": int(prd), "match": bool(act == prd)}
            for act, prd in zip(y_test[:8], y_pred[:8])
        ]

        return ClassificationResult(
            model_name=f"Decision Tree (max_depth={max_depth})",
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1=round(f1, 4),
            confusion_matrix=cm,
            train_samples=len(X_train),
            test_samples=len(X_test),
            feature_count=X.shape[1],
            sample_predictions=sample_preds,
            explanation_tree=tree_text,
        )
