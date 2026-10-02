"""
Experiment 4: Local Search Optimization (Hill Climbing & Simulated Annealing)
=============================================================================
Implements real local-search optimization algorithms:
- Hill Climbing: greedy neighbor evaluation with steepest ascent/descent
- Simulated Annealing: stochastic exploration with geometric temperature cooling
  and Metropolis probabilistic acceptance criterion: P = exp(-ΔE / T)
- Applied strictly to isolated computational benchmark optimization
- SAFETY: Local search is NEVER used to alter clinical decision thresholds,
  patient-specific reference ranges, or medical scoring rules.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple


@dataclass
class OptimizationResult:
    algorithm: str
    best_state: List[float]
    best_score: float
    initial_score: float
    iterations: int
    history: List[float]
    converged: bool
    temperature_final: Optional[float] = None
    acceptance_rate: Optional[float] = None


class ParameterOptimizer:
    """
    Local search optimizer for computational benchmarking and synthetic curve fitting.
    """

    def __init__(self, seed: Optional[int] = 42) -> None:
        if seed is not None:
            random.seed(seed)

    @staticmethod
    def sphere_objective(state: List[float]) -> float:
        """Standard continuous benchmark objective: f(x) = sum(x_i^2). Global minimum at 0.0."""
        return sum(x ** 2 for x in state)

    @staticmethod
    def synthetic_sensor_calibration_loss(state: List[float]) -> float:
        """
        Non-clinical technical benchmark: tunes gain (state[0]) and bias (state[1])
        to calibrate synthetic optical density readings against a known linear sensor target.
        Target: y = 2.5 * x + 0.35.
        """
        gain, bias = state[0], state[1]
        x_vals = [0.1, 0.5, 1.0, 2.0, 3.0]
        y_targets = [0.60, 1.60, 2.85, 5.35, 7.85]

        loss = 0.0
        for x, y_true in zip(x_vals, y_targets):
            pred = gain * x + bias
            loss += (pred - y_true) ** 2
        return loss / len(x_vals)

    def hill_climbing(
        self,
        initial_state: List[float],
        objective_fn: Optional[Callable[[List[float]], float]] = None,
        step_size: float = 0.05,
        max_iterations: int = 500,
        tolerance: float = 1e-6,
    ) -> OptimizationResult:
        """
        Executes steepest-descent hill climbing (minimization).
        Terminates when no neighbor improves upon the current best score.
        """
        fn = objective_fn or self.synthetic_sensor_calibration_loss
        current_state = list(initial_state)
        current_score = fn(current_state)
        initial_score = current_score

        history: List[float] = [current_score]
        dim = len(current_state)
        converged = False

        for i in range(max_iterations):
            best_neighbor: Optional[List[float]] = None
            best_neighbor_score = current_score

            # Explore 2 * dim orthogonal coordinate steps (+/- step_size)
            for d in range(dim):
                for direction in (-1.0, 1.0):
                    neighbor = list(current_state)
                    neighbor[d] += direction * step_size
                    score = fn(neighbor)
                    if score < best_neighbor_score:
                        best_neighbor_score = score
                        best_neighbor = neighbor

            # Check if an improvement was found
            if best_neighbor is not None and (current_score - best_neighbor_score) > tolerance:
                current_state = best_neighbor
                current_score = best_neighbor_score
                history.append(current_score)
            else:
                converged = True
                break

        return OptimizationResult(
            algorithm="Hill Climbing",
            best_state=[round(x, 4) for x in current_state],
            best_score=round(current_score, 6),
            initial_score=round(initial_score, 6),
            iterations=len(history),
            history=history,
            converged=converged,
        )

    def simulated_annealing(
        self,
        initial_state: List[float],
        objective_fn: Optional[Callable[[List[float]], float]] = None,
        initial_temp: float = 100.0,
        cooling_rate: float = 0.95,
        min_temp: float = 0.001,
        max_iterations: int = 1000,
        step_size: float = 0.1,
    ) -> OptimizationResult:
        """
        Executes Simulated Annealing with geometric cooling: T = T * alpha.
        Accepts improvements unconditionally; accepts worsening moves with Metropolis probability:
        P = exp(-(E_new - E_current) / T).
        """
        fn = objective_fn or self.synthetic_sensor_calibration_loss
        current_state = list(initial_state)
        current_score = fn(current_state)
        initial_score = current_score

        best_state = list(current_state)
        best_score = current_score

        history: List[float] = [current_score]
        temp = initial_temp
        dim = len(current_state)
        accepted_worse = 0
        total_proposals = 0

        for it in range(max_iterations):
            if temp <= min_temp:
                break

            total_proposals += 1

            # Generate random perturbation within step_size sphere
            candidate = list(current_state)
            idx = random.randint(0, dim - 1)
            candidate[idx] += random.uniform(-step_size, step_size)

            cand_score = fn(candidate)
            delta = cand_score - current_score

            # Metropolis acceptance criterion
            if delta < 0:
                current_state = candidate
                current_score = cand_score
                if cand_score < best_score:
                    best_state = list(candidate)
                    best_score = cand_score
            else:
                acceptance_prob = math.exp(-delta / max(temp, 1e-9))
                if random.random() < acceptance_prob:
                    current_state = candidate
                    current_score = cand_score
                    accepted_worse += 1

            history.append(current_score)
            temp *= cooling_rate

        acceptance_rate = round(accepted_worse / max(total_proposals, 1), 3)

        return OptimizationResult(
            algorithm="Simulated Annealing",
            best_state=[round(x, 4) for x in best_state],
            best_score=round(best_score, 6),
            initial_score=round(initial_score, 6),
            iterations=len(history),
            history=history,
            converged=True,
            temperature_final=round(temp, 6),
            acceptance_rate=acceptance_rate,
        )
