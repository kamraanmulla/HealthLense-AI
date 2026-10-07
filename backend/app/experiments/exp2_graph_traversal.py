"""
Experiment 2: Graph Traversal Algorithms (BFS & DFS)
======================================================
Explores curated non-diagnostic medical knowledge structures:
- Breadth-First Search (BFS) for shortest concept paths and level-order exploration
- Depth-First Search (DFS) for deep thematic branch exploration
- Clean ontology linking physiological systems, laboratory biomarkers, and lifestyle context
- Graph connectivity represents informational educational affinity, not diagnosis
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple


@dataclass
class TraversalStep:
    node: str
    depth: int
    parent: Optional[str] = None
    relation: Optional[str] = None


@dataclass
class BFSResult:
    start_node: str
    target_node: Optional[str]
    visited_order: List[str]
    path: List[str]
    distance: int
    visited_count: int
    traversal_tree: List[Dict[str, Any]]


@dataclass
class DFSResult:
    start_node: str
    target_node: Optional[str]
    visited_order: List[str]
    path: List[str]
    max_depth: int
    visited_count: int
    cycle_detected: bool


class MedicalKnowledgeGraph:
    """
    Curated non-diagnostic medical knowledge network connecting organ systems,
    biomarkers, metabolic indicators, and nutritional concepts.
    """

    DEFAULT_ONTOLOGY: Dict[str, List[Tuple[str, str, float]]] = {
        # Format: node -> [(neighbor, relationship, edge_weight)]
        "Cardiovascular": [
            ("Lipid Profile", "contains_panel", 1.0),
            ("Blood Pressure", "monitored_by", 1.2),
            ("Cardiac Enzymes", "evaluated_by", 1.5),
        ],
        "Lipid Profile": [
            ("Total Cholesterol", "measures", 1.0),
            ("HDL", "measures", 1.0),
            ("LDL", "measures", 1.0),
            ("Triglycerides", "measures", 1.0),
            ("Cardiovascular", "informs", 1.0),
        ],
        "Metabolic System": [
            ("Glucose Regulation", "regulates", 1.0),
            ("Liver Function", "interacts_with", 1.3),
            ("Kidney Function", "clears_metabolites", 1.4),
        ],
        "Glucose Regulation": [
            ("Fasting Glucose", "measured_by", 1.0),
            ("HbA1c", "indexed_by", 1.0),
            ("Metabolic System", "informs", 1.0),
        ],
        "Hematology": [
            ("CBC", "contains_panel", 1.0),
            ("Iron Metabolism", "interacts_with", 1.2),
        ],
        "CBC": [
            ("Hemoglobin", "measures", 1.0),
            ("RBC", "measures", 1.0),
            ("WBC", "measures", 1.0),
            ("Platelets", "measures", 1.0),
            ("MCV", "measures", 1.0),
            ("Hematology", "informs", 1.0),
        ],
        "Kidney Function": [
            ("Creatinine", "measures", 1.0),
            ("Urea", "measures", 1.0),
            ("eGFR", "calculates", 1.0),
            ("Metabolic System", "informs", 1.4),
        ],
        "Liver Function": [
            ("SGOT (AST)", "measures", 1.0),
            ("SGPT (ALT)", "measures", 1.0),
            ("Bilirubin", "measures", 1.0),
            ("Metabolic System", "informs", 1.3),
        ],
        "Iron Metabolism": [
            ("Ferritin", "measures", 1.0),
            ("Serum Iron", "measures", 1.0),
            ("Hemoglobin", "modulates", 1.1),
        ],
        # Leaf biomarker connections back to panels and to educational Health Concern / Follow-up nodes
        "Total Cholesterol": [
            ("Lipid Profile", "belongs_to", 1.0),
            ("Atherogenic Risk Concern", "indicates_possible", 1.2),
        ],
        "Atherogenic Risk Concern": [
            ("Lipid Follow-up & Diet Consultation", "recommended_followup", 1.0),
        ],
        "Lipid Follow-up & Diet Consultation": [],
        "HDL": [("Lipid Profile", "belongs_to", 1.0)],
        "LDL": [("Lipid Profile", "belongs_to", 1.0)],
        "Triglycerides": [("Lipid Profile", "belongs_to", 1.0)],
        "Fasting Glucose": [
            ("Glucose Regulation", "belongs_to", 1.0),
            ("Glycemic Dysregulation Concern", "indicates_possible", 1.2),
        ],
        "Glycemic Dysregulation Concern": [
            ("Fasting Re-test & Nutritional Counseling", "recommended_followup", 1.0),
        ],
        "Fasting Re-test & Nutritional Counseling": [],
        "HbA1c": [("Glucose Regulation", "belongs_to", 1.0)],
        "Hemoglobin": [
            ("CBC", "belongs_to", 1.0),
            ("Iron Metabolism", "related_to", 1.1),
            ("Fatigue & Low Oxygenation Concern", "indicates_possible", 1.2),
        ],
        "Fatigue & Low Oxygenation Concern": [
            ("Serum Ferritin Test & CBC Monitoring", "recommended_followup", 1.0),
        ],
        "Serum Ferritin Test & CBC Monitoring": [],
        "RBC": [("CBC", "belongs_to", 1.0)],
        "WBC": [("CBC", "belongs_to", 1.0)],
        "Platelets": [("CBC", "belongs_to", 1.0)],
        "MCV": [("CBC", "belongs_to", 1.0)],
        "Creatinine": [
            ("Kidney Function", "belongs_to", 1.0),
            ("Reduced Filtration Concern", "indicates_possible", 1.2),
        ],
        "Reduced Filtration Concern": [
            ("Renal Function Panel & Hydration Review", "recommended_followup", 1.0),
        ],
        "Renal Function Panel & Hydration Review": [],
        "Urea": [("Kidney Function", "belongs_to", 1.0)],
        "SGOT (AST)": [("Liver Function", "belongs_to", 1.0)],
        "SGPT (ALT)": [("Liver Function", "belongs_to", 1.0)],
        "Bilirubin": [("Liver Function", "belongs_to", 1.0)],
        "Ferritin": [("Iron Metabolism", "belongs_to", 1.0)],
    }

    def __init__(self, custom_ontology: Optional[Dict[str, List[Tuple[str, str, float]]]] = None):
        self.adjacency: Dict[str, List[Tuple[str, str, float]]] = custom_ontology or self.DEFAULT_ONTOLOGY

    def get_neighbors(self, node: str) -> List[Tuple[str, str, float]]:
        """Returns list of (neighbor_node, relation_label, weight)."""
        return self.adjacency.get(node, [])

    def breadth_first_search(self, start_node: str, target_node: Optional[str] = None) -> BFSResult:
        """
        Executes standard BFS using a FIFO queue.
        Finds the unweighted shortest path and level-order traversal.
        """
        if start_node not in self.adjacency:
            return BFSResult(
                start_node=start_node,
                target_node=target_node,
                visited_order=[],
                path=[],
                distance=-1,
                visited_count=0,
                traversal_tree=[],
            )

        queue: deque[Tuple[str, int]] = deque([(start_node, 0)])
        visited: Set[str] = {start_node}
        parent_map: Dict[str, Optional[str]] = {start_node: None}
        relation_map: Dict[str, Optional[str]] = {start_node: None}
        visited_order: List[str] = []
        traversal_tree: List[Dict[str, Any]] = []

        found = False

        while queue:
            current, depth = queue.popleft()
            visited_order.append(current)

            explanation_text = (
                f"Starting root concept '{current}'."
                if parent_map[current] is None
                else f"Explored '{current}' linked from '{parent_map[current]}' via ontological association '{relation_map[current]}'."
            )
            traversal_tree.append({
                "node": current,
                "depth": depth,
                "parent": parent_map[current],
                "relation": relation_map[current],
                "explanation": explanation_text,
            })

            if target_node and current == target_node:
                found = True
                break

            for neighbor, relation, _ in self.get_neighbors(current):
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent_map[neighbor] = current
                    relation_map[neighbor] = relation
                    queue.append((neighbor, depth + 1))

        # Reconstruct path if target requested
        path: List[str] = []
        if target_node and found:
            curr = target_node
            while curr is not None:
                path.append(curr)
                curr = parent_map.get(curr)
            path.reverse()

        return BFSResult(
            start_node=start_node,
            target_node=target_node,
            visited_order=visited_order,
            path=path,
            distance=len(path) - 1 if path else -1,
            visited_count=len(visited_order),
            traversal_tree=traversal_tree,
        )

    def depth_first_search(
        self, start_node: str, target_node: Optional[str] = None, max_depth_limit: int = 15
    ) -> DFSResult:
        """
        Executes standard DFS using an explicit LIFO stack.
        Tracks search path, tree depth, and cycle detection.
        """
        if start_node not in self.adjacency:
            return DFSResult(
                start_node=start_node,
                target_node=target_node,
                visited_order=[],
                path=[],
                max_depth=0,
                visited_count=0,
                cycle_detected=False,
            )

        stack: List[Tuple[str, int, List[str]]] = [(start_node, 0, [start_node])]
        visited: Set[str] = set()
        visited_order: List[str] = []
        path_to_target: List[str] = []
        max_depth = 0
        cycle_detected = False

        while stack:
            current, depth, current_path = stack.pop()

            if current in current_path[:-1]:
                cycle_detected = True

            if current not in visited:
                visited.add(current)
                visited_order.append(current)
                if depth > max_depth:
                    max_depth = depth

                if target_node and current == target_node:
                    path_to_target = current_path
                    break

                if depth < max_depth_limit:
                    # Push neighbors in reverse order for deterministic left-to-right order
                    neighbors = self.get_neighbors(current)
                    for neighbor, _, _ in reversed(neighbors):
                        if neighbor not in visited:
                            stack.append((neighbor, depth + 1, current_path + [neighbor]))

        return DFSResult(
            start_node=start_node,
            target_node=target_node,
            visited_order=visited_order,
            path=path_to_target,
            max_depth=max_depth,
            visited_count=len(visited_order),
            cycle_detected=cycle_detected,
        )

    def map_parameter_to_concept(self, parameter_name: str) -> Optional[str]:
        """
        Maps a clinical parameter name from user reports to the closest matching
        concept node in the medical knowledge graph ontology.
        """
        if not parameter_name:
            return None
        p_clean = parameter_name.lower().strip()

        # Direct exact match
        for node in self.adjacency.keys():
            if node.lower() == p_clean:
                return node

        # Clinical synonyms and abbreviations
        synonyms = {
            "glucose": "Fasting Glucose",
            "blood sugar": "Fasting Glucose",
            "fbs": "Fasting Glucose",
            "sugar": "Fasting Glucose",
            "hba1c": "HbA1c",
            "a1c": "HbA1c",
            "glycated": "HbA1c",
            "cholesterol": "Total Cholesterol",
            "total cholesterol": "Total Cholesterol",
            "hdl": "HDL",
            "ldl": "LDL",
            "triglyceride": "Triglycerides",
            "tg": "Triglycerides",
            "hemoglobin": "Hemoglobin",
            "haemoglobin": "Hemoglobin",
            "hb": "Hemoglobin",
            "rbc": "RBC",
            "wbc": "WBC",
            "platelet": "Platelets",
            "mcv": "MCV",
            "creatinine": "Creatinine",
            "urea": "Urea",
            "bun": "Urea",
            "ast": "SGOT (AST)",
            "sgot": "SGOT (AST)",
            "alt": "SGPT (ALT)",
            "sgpt": "SGPT (ALT)",
            "bilirubin": "Bilirubin",
            "ferritin": "Ferritin",
            "iron": "Serum Iron",
            "blood pressure": "Blood Pressure",
            "bp": "Blood Pressure",
        }
        for syn_key, node in synonyms.items():
            if syn_key in p_clean:
                return node

        # Substring search in ontology
        for node in self.adjacency.keys():
            if node.lower() in p_clean or p_clean in node.lower():
                return node

        return None
