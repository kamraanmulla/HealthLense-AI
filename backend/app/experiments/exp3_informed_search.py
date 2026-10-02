"""
Experiment 3: Informed Heuristic Search (Greedy Best-First & A*)
================================================================
Implements real heuristic-driven graph search algorithms:
- Greedy Best-First Search: expands nodes strictly based on heuristic estimate h(n)
- A* Search: evaluates nodes using f(n) = g(n) + h(n) with admissible heuristics
- Applied to a non-clinical laboratory biomarker navigation graph
- Tracks node expansion counts, path costs, and execution steps
"""

from __future__ import annotations

import heapq
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Set, Tuple


@dataclass
class SearchNode:
    name: str
    g_cost: float = 0.0
    h_cost: float = 0.0
    parent: Optional[SearchNode] = None

    @property
    def f_cost(self) -> float:
        return self.g_cost + self.h_cost

    def __lt__(self, other: SearchNode) -> bool:
        return self.f_cost < other.f_cost


@dataclass
class SearchResult:
    algorithm: str
    start_node: str
    target_node: str
    path: List[str]
    total_cost: float
    nodes_expanded: int
    visited_order: List[str]
    success: bool
    iterations: int


class MedicalSearchRouter:
    """
    Search router navigating structured laboratory panels and biomarker relationships.
    Uses realistic network topology with explicit edge transition costs and coordinate-based heuristics.
    """

    # Biomarker network nodes with 2D conceptual coordinates (for Euclidean/Manhattan heuristic distance)
    # Conceptual space: X = Metabolic/Cellular complexity, Y = Organ system domain
    NODE_COORDINATES: Dict[str, Tuple[float, float]] = {
        "Patient Intake": (0.0, 0.0),
        "Vital Signs": (1.0, 1.0),
        "CBC Panel": (2.0, 4.0),
        "Hemoglobin": (3.0, 5.0),
        "Platelets": (3.0, 3.5),
        "WBC Differential": (3.5, 4.5),
        "Metabolic Panel": (2.5, 1.0),
        "Fasting Glucose": (4.0, 1.0),
        "HbA1c": (5.0, 1.5),
        "Lipid Panel": (2.0, -2.0),
        "Total Cholesterol": (3.5, -2.0),
        "Triglycerides": (4.0, -1.5),
        "Liver Panel": (3.0, -0.5),
        "SGOT (AST)": (4.5, -0.5),
        "SGPT (ALT)": (4.5, 0.0),
        "Kidney Panel": (3.0, 2.5),
        "Serum Creatinine": (4.5, 2.5),
        "Blood Urea Nitrogen": (4.5, 3.0),
    }

    # Directed edges: node -> [(neighbor, transition_cost)]
    GRAPH_EDGES: Dict[str, List[Tuple[str, float]]] = {
        "Patient Intake": [("Vital Signs", 1.0), ("Metabolic Panel", 2.5), ("CBC Panel", 2.0)],
        "Vital Signs": [("Metabolic Panel", 1.5), ("Lipid Panel", 2.0)],
        "CBC Panel": [("Hemoglobin", 1.0), ("Platelets", 1.2), ("WBC Differential", 1.5)],
        "Hemoglobin": [("WBC Differential", 1.1), ("Kidney Panel", 2.5)],
        "Platelets": [("WBC Differential", 1.0)],
        "WBC Differential": [("Metabolic Panel", 3.0)],
        "Metabolic Panel": [("Fasting Glucose", 1.0), ("Liver Panel", 1.8), ("Kidney Panel", 1.5)],
        "Fasting Glucose": [("HbA1c", 1.5), ("Lipid Panel", 2.0)],
        "HbA1c": [("Lipid Panel", 2.2)],
        "Lipid Panel": [("Total Cholesterol", 1.0), ("Triglycerides", 1.2)],
        "Total Cholesterol": [("Triglycerides", 1.0)],
        "Triglycerides": [("Liver Panel", 2.0)],
        "Liver Panel": [("SGOT (AST)", 1.0), ("SGPT (ALT)", 1.0)],
        "SGOT (AST)": [("SGPT (ALT)", 0.8)],
        "Kidney Panel": [("Serum Creatinine", 1.0), ("Blood Urea Nitrogen", 1.2)],
        "Serum Creatinine": [("Blood Urea Nitrogen", 0.9)],
        "Blood Urea Nitrogen": [],
        "SGPT (ALT)": [],
    }

    def __init__(self) -> None:
        self.edges = self.GRAPH_EDGES
        self.coords = self.NODE_COORDINATES

    def heuristic(self, current: str, target: str) -> float:
        """
        Admissible Euclidean distance heuristic between two nodes in conceptual space.
        h(target, target) == 0.0.
        """
        if current not in self.coords or target not in self.coords:
            return 0.0
        x1, y1 = self.coords[current]
        x2, y2 = self.coords[target]
        return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5

    def a_star_search(self, start: str, target: str) -> SearchResult:
        """
        Executes A* search prioritizing nodes with minimal f(n) = g(n) + h(n).
        Guarantees optimal path when heuristic is admissible.
        """
        if start not in self.edges or target not in self.coords:
            return SearchResult("A*", start, target, [], 0.0, 0, [], False, 0)

        counter = 0
        open_set: List[Tuple[float, float, int, SearchNode]] = []
        initial_h = self.heuristic(start, target)
        start_node = SearchNode(name=start, g_cost=0.0, h_cost=initial_h)
        heapq.heappush(open_set, (start_node.f_cost, initial_h, counter, start_node))

        g_costs: Dict[str, float] = {start: 0.0}
        visited_order: List[str] = []
        closed_set: Set[str] = set()
        iterations = 0

        while open_set:
            iterations += 1
            _, _, _, current_node = heapq.heappop(open_set)
            curr_name = current_node.name

            if curr_name in closed_set:
                continue

            closed_set.add(curr_name)
            visited_order.append(curr_name)

            if curr_name == target:
                path = self._reconstruct_path(current_node)
                return SearchResult(
                    algorithm="A*",
                    start_node=start,
                    target_node=target,
                    path=path,
                    total_cost=round(current_node.g_cost, 3),
                    nodes_expanded=len(visited_order),
                    visited_order=visited_order,
                    success=True,
                    iterations=iterations,
                )

            for neighbor, edge_cost in self.edges.get(curr_name, []):
                new_g = current_node.g_cost + edge_cost
                if neighbor not in g_costs or new_g < g_costs[neighbor]:
                    g_costs[neighbor] = new_g
                    h_val = self.heuristic(neighbor, target)
                    next_node = SearchNode(name=neighbor, g_cost=new_g, h_cost=h_val, parent=current_node)
                    counter += 1
                    heapq.heappush(open_set, (next_node.f_cost, h_val, counter, next_node))

        return SearchResult("A*", start, target, [], 0.0, len(visited_order), visited_order, False, iterations)

    def greedy_best_first_search(self, start: str, target: str) -> SearchResult:
        """
        Executes Greedy Best-First Search prioritizing strictly lowest heuristic h(n).
        """
        if start not in self.edges or target not in self.coords:
            return SearchResult("Greedy Best-First", start, target, [], 0.0, 0, [], False, 0)

        counter = 0
        open_set: List[Tuple[float, int, SearchNode]] = []
        initial_h = self.heuristic(start, target)
        start_node = SearchNode(name=start, g_cost=0.0, h_cost=initial_h)
        heapq.heappush(open_set, (initial_h, counter, start_node))

        visited_order: List[str] = []
        visited: Set[str] = set()
        iterations = 0

        while open_set:
            iterations += 1
            _, _, current_node = heapq.heappop(open_set)
            curr_name = current_node.name

            if curr_name in visited:
                continue

            visited.add(curr_name)
            visited_order.append(curr_name)

            if curr_name == target:
                path = self._reconstruct_path(current_node)
                return SearchResult(
                    algorithm="Greedy Best-First",
                    start_node=start,
                    target_node=target,
                    path=path,
                    total_cost=round(current_node.g_cost, 3),
                    nodes_expanded=len(visited_order),
                    visited_order=visited_order,
                    success=True,
                    iterations=iterations,
                )

            for neighbor, edge_cost in self.edges.get(curr_name, []):
                if neighbor not in visited:
                    h_val = self.heuristic(neighbor, target)
                    next_node = SearchNode(
                        name=neighbor,
                        g_cost=current_node.g_cost + edge_cost,
                        h_cost=h_val,
                        parent=current_node,
                    )
                    counter += 1
                    heapq.heappush(open_set, (h_val, counter, next_node))

        return SearchResult("Greedy Best-First", start, target, [], 0.0, len(visited_order), visited_order, False, iterations)

    def _reconstruct_path(self, node: SearchNode) -> List[str]:
        path = []
        curr: Optional[SearchNode] = node
        while curr:
            path.append(curr.name)
            curr = curr.parent
        path.reverse()
        return path
