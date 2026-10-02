"""
Experiment 6: Linear Regression & Trend Modeling
=================================================
Implements real Linear Regression using scikit-learn:
- Feature engineering and input validation
- Train/test dataset separation
- Closed-form least squares model fitting (y = Xw + b)
- Comprehensive evaluation metrics: MAE, MSE, RMSE, and R²
- Descriptive trajectory estimation for longitudinal measurements
- Clear educational disclaimer and safety boundaries
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


@dataclass
class RegressionResult:
    slope: float
    intercept: float
    mae: float
    mse: float
    rmse: float
    r2: float
    sample_size: int
    train_size: int
    test_size: int
    predictions: List[Dict[str, float]]
    trend_direction: str  # "increasing", "decreasing", "stable"
    educational_note: str
    fitted_line: List[Dict[str, float]] = field(default_factory=list)


class TrendRegressionService:
    """
    Descriptive longitudinal trajectory estimator and synthetic regression benchmark.
    """

    @staticmethod
    def generate_synthetic_benchmark(
        n_samples: int = 100, slope: float = 1.8, intercept: float = 4.2, noise_std: float = 0.5, seed: int = 42
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Generates reproducible continuous synthetic data for algorithm validation."""
        rng = np.random.default_rng(seed)
        X = rng.uniform(1.0, 50.0, size=(n_samples, 1))
        noise = rng.normal(0.0, noise_std, size=(n_samples, 1))
        y = slope * X + intercept + noise
        return X, y.ravel()

    def train_and_evaluate(
        self,
        X: np.ndarray,
        y: np.ndarray,
        test_size: float = 0.2,
        seed: int = 42,
    ) -> RegressionResult:
        """
        Trains a standard Linear Regression model on given feature/target arrays
        and evaluates out-of-sample metrics.
        """
        if len(X) < 4:
            raise ValueError(f"Insufficient samples for regression ({len(X)} provided, minimum 4 required).")

        X_2d = X.reshape(-1, 1) if X.ndim == 1 else X
        y_1d = y.ravel()

        X_train, X_test, y_train, y_test = train_test_split(
            X_2d, y_1d, test_size=test_size, random_state=seed
        )

        model = LinearRegression()
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        slope_val = float(model.coef_[0]) if len(model.coef_) > 0 else 0.0
        intercept_val = float(model.intercept_)

        if slope_val > 0.05:
            direction = "increasing"
        elif slope_val < -0.05:
            direction = "decreasing"
        else:
            direction = "stable"

        preds = [
            {"x": round(float(x[0]), 2), "actual": round(float(actual), 2), "predicted": round(float(pred), 2)}
            for x, actual, pred in zip(X_test[:10], y_test[:10], y_pred[:10])
        ]

        # Generate fitted line points across all observation inputs
        fitted_points = [
            {"x": round(float(pt[0]), 2), "fitted_y": round(float(slope_val * pt[0] + intercept_val), 2)}
            for pt in X_2d
        ]

        return RegressionResult(
            slope=round(slope_val, 4),
            intercept=round(intercept_val, 4),
            mae=round(mae, 4),
            mse=round(mse, 4),
            rmse=round(rmse, 4),
            r2=round(r2, 4),
            sample_size=len(X),
            train_size=len(X_train),
            test_size=len(X_test),
            predictions=preds,
            trend_direction=direction,
            educational_note=(
                "Linear regression illustrates mathematical trajectory over past observations. "
                "It does not represent a clinical forecast, diagnosis, or disease progression model."
            ),
            fitted_line=fitted_points,
        )

    def fit_longitudinal_trajectory(
        self, historical_points: List[Dict[str, Any]]
    ) -> Optional[RegressionResult]:
        """
        Fits a descriptive trajectory over chronological user measurements
        where at least 4 observations exist.
        """
        if not historical_points or len(historical_points) < 4:
            return None

        # Sort chronologically
        sorted_points = sorted(historical_points, key=lambda p: p.get("date", ""))
        days = []
        vals = []

        import datetime
        try:
            base_date = datetime.datetime.fromisoformat(str(sorted_points[0]["date"]).replace("Z", "+00:00"))
            for p in sorted_points:
                val = float(p["value"])
                dt = datetime.datetime.fromisoformat(str(p["date"]).replace("Z", "+00:00"))
                day_offset = (dt - base_date).total_seconds() / 86400.0
                days.append(day_offset)
                vals.append(val)
        except Exception:
            # Fallback to sequential index
            days = list(range(len(sorted_points)))
            vals = [float(p["value"]) for p in sorted_points]

        X = np.array(days, dtype=float).reshape(-1, 1)
        y = np.array(vals, dtype=float)

        return self.train_and_evaluate(X, y, test_size=0.25)
