"""
Experiment 8: Unsupervised K-Means Clustering & Metric Partitioning
==================================================================
Implements real K-Means clustering using scikit-learn:
- Data validation and standard z-score normalization
- Configurable cluster count (k) with centroid determination
- Inertia calculation (within-cluster sum of squares)
- Cluster size distribution and centroid profiles
- 2D scatter coordinates generation with PCA projection for multi-dimensional data
- Extracts and clusters user-specific report biomarker observations with privacy isolation
- SAFETY: Clusters represent mathematical statistical groupings based on selected variables.
  They are NEVER labeled as 'healthy', 'unhealthy', or 'disease stages'.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


@dataclass
class ClusterProfile:
    cluster_id: int
    size: int
    percentage: float
    centroid_normalized: List[float]
    centroid_original: List[float]


@dataclass
class ClusteringResult:
    n_clusters: int
    n_samples: int
    n_features: int
    feature_names: List[str]
    inertia: float
    cluster_profiles: List[ClusterProfile]
    cluster_assignments: List[int]
    scatter_points: List[Dict[str, Any]] = field(default_factory=list)
    feature_x_label: str = ""
    feature_y_label: str = ""
    pca_applied: bool = False
    pca_explained_variance: Optional[List[float]] = None
    educational_note: str = (
        "Clusters represent mathematical groupings based solely on metric geometric proximity. "
        "They do not define clinical risk tiers, disease categories, or physiological diagnoses."
    )


class CohortClusterService:
    """
    Unsupervised statistical metric clustering service for exploratory health data analysis.
    Supports both user-specific report clustering and isolated educational benchmarks.
    """

    @staticmethod
    def generate_synthetic_cohort(
        n_samples: int = 180, n_clusters: int = 3, seed: int = 42
    ) -> Tuple[np.ndarray, List[str]]:
        """
        Generates continuous synthetic biometric data representing multi-marker observations:
        Features: [Fasting Glucose (mg/dL), Total Cholesterol (mg/dL), Systolic BP (mmHg)].
        Used exclusively for educational demonstration.
        """
        rng = np.random.default_rng(seed)
        cluster_centers = [
            [88.0, 165.0, 115.0],   # Center 1
            [115.0, 210.0, 130.0],  # Center 2
            [140.0, 245.0, 145.0],  # Center 3
        ]
        samples_per = n_samples // n_clusters
        data_blocks = []

        for center in cluster_centers[:n_clusters]:
            block = rng.normal(loc=center, scale=[10.0, 18.0, 8.0], size=(samples_per, 3))
            data_blocks.append(block)

        X = np.vstack(data_blocks)
        features = ["Glucose (mg/dL)", "Cholesterol (mg/dL)", "Systolic BP (mmHg)"]
        return X, features

    def build_user_observation_matrix(
        self, user_reports: List[Any], min_clusters: int = 2
    ) -> Tuple[Optional[np.ndarray], List[str], List[str], Optional[str]]:
        """
        Builds a multi-marker observation matrix from the authenticated user's completed reports.
        Each row is one report observation; columns are numerical biomarker values.
        Returns: (X, feature_names, report_labels, insufficient_reason)
        """
        if not user_reports or len(user_reports) < min_clusters:
            return (
                None,
                [],
                [],
                f"Clustering requires at least {min_clusters} completed reports. Currently you have {len(user_reports) if user_reports else 0}.",
            )

        # Collect parameter maps per report
        report_param_maps: List[Tuple[str, Dict[str, float]]] = []
        for report in user_reports:
            p_map: Dict[str, float] = {}
            for p in getattr(report, "parameters", []):
                if p.value is not None:
                    try:
                        val = float(p.value)
                        p_name = p.name.strip().title()
                        p_map[p_name] = val
                    except (ValueError, TypeError):
                        continue
            if p_map:
                date_str = ""
                if getattr(report, "created_at", None):
                    date_str = report.created_at.strftime("%b %d, %Y")
                label = f"{getattr(report, 'original_filename', 'Report')} ({date_str})" if date_str else getattr(report, 'original_filename', 'Report')
                report_param_maps.append((label, p_map))

        if len(report_param_maps) < min_clusters:
            return (
                None,
                [],
                [],
                f"Found only {len(report_param_maps)} report(s) with valid numerical biomarkers. At least {min_clusters} required.",
            )

        # Find parameters that appear in at least 2 reports
        param_counts: Dict[str, int] = {}
        for _, p_map in report_param_maps:
            for p_name in p_map.keys():
                param_counts[p_name] = param_counts.get(p_name, 0) + 1

        selected_features = [p_name for p_name, count in param_counts.items() if count >= 2]

        if not selected_features:
            # Fallback: take the top available parameters across reports
            all_params = sorted(param_counts.keys(), key=lambda k: param_counts[k], reverse=True)
            selected_features = all_params[:3]

        if len(selected_features) < 1:
            return (
                None,
                [],
                [],
                "No consistent laboratory biomarkers found across your reports to form cluster dimensions.",
            )

        # Build feature matrix, imputing missing values with column mean
        valid_rows: List[List[float]] = []
        valid_labels: List[str] = []

        # First pass: collect available numbers to calculate means
        feature_vals: Dict[str, List[float]] = {f: [] for f in selected_features}
        for _, p_map in report_param_maps:
            for f in selected_features:
                if f in p_map:
                    feature_vals[f].append(p_map[f])

        feature_means = {
            f: float(np.mean(vals)) if vals else 0.0
            for f, vals in feature_vals.items()
        }

        for label, p_map in report_param_maps:
            # Check if this report has at least one of the selected features
            has_any = any(f in p_map for f in selected_features)
            if not has_any:
                continue
            row = [p_map.get(f, feature_means[f]) for f in selected_features]
            valid_rows.append(row)
            valid_labels.append(label)

        if len(valid_rows) < min_clusters:
            return (
                None,
                [],
                [],
                f"Only {len(valid_rows)} observation(s) contain the selected biomarker features ({', '.join(selected_features[:3])}). Minimum {min_clusters} required.",
            )

        X = np.array(valid_rows, dtype=float)
        return X, selected_features, valid_labels, None

    def fit_clusters(
        self,
        X: np.ndarray,
        n_clusters: int = 3,
        feature_names: Optional[List[str]] = None,
        sample_labels: Optional[List[str]] = None,
        seed: int = 42,
    ) -> ClusteringResult:
        """
        Executes K-Means clustering with standard scaling and centroid inverse-transformation.
        Applies PCA for 2D visualization when dimensions > 2.
        """
        # Ensure k does not exceed sample count
        actual_k = min(n_clusters, len(X))
        if actual_k < 2:
            raise ValueError(f"Sample count ({len(X)}) must be at least 2 for clustering.")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=actual_k, random_state=seed, n_init=10)
        kmeans.fit(X_scaled)

        assignments = [int(a) for a in kmeans.labels_]
        centroids_scaled = kmeans.cluster_centers_
        centroids_orig = scaler.inverse_transform(centroids_scaled)

        names = feature_names or [f"Feature_{i}" for i in range(X.shape[1])]
        total_n = len(X)
        profiles: List[ClusterProfile] = []

        for cid in range(actual_k):
            c_size = int(np.sum(kmeans.labels_ == cid))
            pct = round(c_size / total_n * 100, 1)
            c_scaled = [round(float(v), 3) for v in centroids_scaled[cid]]
            c_orig = [round(float(v), 2) for v in centroids_orig[cid]]

            profiles.append(
                ClusterProfile(
                    cluster_id=cid,
                    size=c_size,
                    percentage=pct,
                    centroid_normalized=c_scaled,
                    centroid_original=c_orig,
                )
            )

        # 2D Scatter Coordinate Projection
        pca_applied = False
        pca_variance = None
        if X.shape[1] > 2:
            pca = PCA(n_components=2, random_state=seed)
            coords_2d = pca.fit_transform(X_scaled)
            pca_applied = True
            pca_variance = [round(float(v) * 100, 1) for v in pca.explained_variance_ratio_]
            feature_x_label = f"PC1 ({pca_variance[0]}% var)"
            feature_y_label = f"PC2 ({pca_variance[1]}% var)"
        elif X.shape[1] == 2:
            coords_2d = X
            feature_x_label = names[0]
            feature_y_label = names[1]
        else:
            # 1D feature
            coords_2d = np.hstack([X, np.zeros((len(X), 1))])
            feature_x_label = names[0]
            feature_y_label = "Baseline"

        scatter_points = []
        for i in range(len(X)):
            lbl = sample_labels[i] if sample_labels and i < len(sample_labels) else f"Observation {i+1}"
            scatter_points.append({
                "x": round(float(coords_2d[i, 0]), 2),
                "y": round(float(coords_2d[i, 1]), 2),
                "cluster_id": assignments[i],
                "label": lbl,
                "values": {names[j]: round(float(X[i, j]), 2) for j in range(min(len(names), X.shape[1]))},
            })

        return ClusteringResult(
            n_clusters=actual_k,
            n_samples=total_n,
            n_features=X.shape[1],
            feature_names=names,
            inertia=round(float(kmeans.inertia_), 3),
            cluster_profiles=profiles,
            cluster_assignments=assignments[:50],
            scatter_points=scatter_points,
            feature_x_label=feature_x_label,
            feature_y_label=feature_y_label,
            pca_applied=pca_applied,
            pca_explained_variance=pca_variance,
        )
