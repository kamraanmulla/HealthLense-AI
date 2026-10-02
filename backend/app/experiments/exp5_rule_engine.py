"""
Experiment 5: Knowledge Representation & Inference (Forward & Backward Chaining)
================================================================================
Transparent, testable expert system inference engine:
- Facts: structured knowledge tokens with confidence scores and provenance
- Rules: antecedent conjunctions yielding consequent inferences
- Forward Chaining: bottom-up data-driven inference deriving all reachable conclusions
- Backward Chaining: top-down goal-directed proof search resolving hypothesis sub-goals
- Inference Trace: step-by-step transparent audit log of rule firing
- Contradiction and missing-fact detection
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class Fact:
    name: str
    value: Any = True
    source: str = "given"  # "given" or "inferred"
    rule_id: Optional[str] = None
    explanation: Optional[str] = None
    supporting_facts: List[str] = field(default_factory=list)

    def __hash__(self) -> int:
        return hash((self.name, str(self.value)))

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Fact):
            return False
        return self.name == other.name and self.value == other.value


@dataclass
class Rule:
    rule_id: str
    description: str
    antecedents: List[Tuple[str, Any]]  # [(fact_name, expected_value)]
    consequent: Tuple[str, Any]         # (inferred_fact_name, inferred_value)
    explanation: str


@dataclass
class InferenceResult:
    mode: str  # "forward" | "backward"
    goal: Optional[str]
    success: bool
    derived_facts: List[Dict[str, Any]]
    fired_rules: List[str]
    trace: List[str]
    missing_facts: List[str]
    contradictions: List[str]


class RuleEngine:
    """
    Transparent inference engine providing explainable, traceable decision logic.
    """

    DEFAULT_HEALTH_RULES: List[Rule] = [
        Rule(
            rule_id="R1_ANEMIA_SUSPICION",
            description="Low hemoglobin and low MCV indicate microcytic profile",
            antecedents=[("hemoglobin_low", True), ("mcv_low", True)],
            consequent=("microcytic_pattern", True),
            explanation="Both hemoglobin concentration and mean corpuscular volume are below lab reference levels.",
        ),
        Rule(
            rule_id="R2_IRON_CORRELATION",
            description="Microcytic pattern with low ferritin indicates iron deficiency pattern",
            antecedents=[("microcytic_pattern", True), ("ferritin_low", True)],
            consequent=("iron_deficiency_pattern", True),
            explanation="Microcytic red blood cell indices align with depleted ferritin storage reserves.",
        ),
        Rule(
            rule_id="R3_GLUCOSE_ELEVATED",
            description="Elevated fasting glucose indicates glycemic attention",
            antecedents=[("glucose_fasting_high", True)],
            consequent=("glycemic_attention_needed", True),
            explanation="Fasting blood glucose exceeds standard normative fasting baseline.",
        ),
        Rule(
            rule_id="R4_METABOLIC_SYNERGY",
            description="Glycemic attention with elevated HbA1c indicates persistent glucose elevation",
            antecedents=[("glycemic_attention_needed", True), ("hba1c_high", True)],
            consequent=("sustained_hyperglycemia_pattern", True),
            explanation="Concurrent fasting blood glucose and 90-day glycated hemoglobin elevation.",
        ),
        Rule(
            rule_id="R5_RENAL_ATTENTION",
            description="Elevated creatinine and BUN indicate renal filtration attention",
            antecedents=[("creatinine_high", True), ("bun_high", True)],
            consequent=("renal_filtration_attention", True),
            explanation="Elevated serum nitrogenous metabolites indicate potential alteration in kidney clearance.",
        ),
        Rule(
            rule_id="R6_LIPID_DYSLIPIDEMIA",
            description="Elevated LDL and low HDL indicate atherogenic lipid balance",
            antecedents=[("ldl_high", True), ("hdl_low", True)],
            consequent=("lipid_imbalance_pattern", True),
            explanation="Elevated low-density lipoprotein alongside suboptimal high-density lipoprotein ratio.",
        ),
    ]

    def __init__(self, rules: Optional[List[Rule]] = None) -> None:
        self.rules: List[Rule] = rules or self.DEFAULT_HEALTH_RULES

    def forward_chain(self, initial_facts: Dict[str, Any]) -> InferenceResult:
        """
        Bottom-up data-driven forward chaining.
        Repeatedly matches rule antecedents against the fact database and derives new conclusions
        until no new facts can be added (fixed-point saturation).
        """
        known_facts: Dict[str, Fact] = {
            k: Fact(name=k, value=v, source="given") for k, v in initial_facts.items()
        }
        fired_rules: List[str] = []
        trace: List[str] = [f"Initialized with {len(known_facts)} given facts: {list(initial_facts.keys())}"]
        contradictions: List[str] = []

        added_new_fact = True
        iteration = 0

        while added_new_fact:
            iteration += 1
            added_new_fact = False

            for rule in self.rules:
                if rule.rule_id in fired_rules:
                    continue

                # Check if all antecedents are satisfied in known_facts
                all_satisfied = True
                for ant_name, ant_val in rule.antecedents:
                    if ant_name not in known_facts or known_facts[ant_name].value != ant_val:
                        all_satisfied = False
                        break

                if all_satisfied:
                    conseq_name, conseq_val = rule.consequent

                    # Contradiction check: same fact name with conflicting value
                    if conseq_name in known_facts and known_facts[conseq_name].value != conseq_val:
                        msg = f"Contradiction detected for {conseq_name}: existing={known_facts[conseq_name].value}, rule {rule.rule_id} asserts={conseq_val}"
                        contradictions.append(msg)
                        trace.append(f"[CONTRADICTION] {msg}")

                    if conseq_name not in known_facts:
                        sup_facts = [ant_name for ant_name, _ in rule.antecedents]
                        new_fact = Fact(
                            name=conseq_name,
                            value=conseq_val,
                            source="inferred",
                            rule_id=rule.rule_id,
                            explanation=rule.explanation,
                            supporting_facts=sup_facts,
                        )
                        known_facts[conseq_name] = new_fact
                        fired_rules.append(rule.rule_id)
                        added_new_fact = True
                        trace.append(f"[FIRED {rule.rule_id}] Inferred '{conseq_name}'={conseq_val} supported by {sup_facts} via: {rule.description}")

        derived_list = [
            {
                "fact": f.name,
                "value": f.value,
                "source": f.source,
                "rule_id": f.rule_id,
                "explanation": f.explanation,
                "supporting_facts": f.supporting_facts,
            }
            for f in known_facts.values()
        ]

        return InferenceResult(
            mode="forward",
            goal=None,
            success=True,
            derived_facts=derived_list,
            fired_rules=fired_rules,
            trace=trace,
            missing_facts=[],
            contradictions=contradictions,
        )

    def backward_chain(self, goal_name: str, goal_val: Any, initial_facts: Dict[str, Any]) -> InferenceResult:
        """
        Top-down goal-directed backward chaining.
        Recursively verifies if goal_name == goal_val can be proven from initial_facts or matching rules.
        """
        known_facts: Dict[str, Fact] = {
            k: Fact(name=k, value=v, source="given") for k, v in initial_facts.items()
        }
        fired_rules: List[str] = []
        trace: List[str] = []
        missing_facts: List[str] = []
        visited_goals: Set[Tuple[str, Any]] = set()

        def prove(target_name: str, target_val: Any, depth: int) -> bool:
            indent = "  " * depth
            goal_key = (target_name, target_val)

            # Cycle detection
            if goal_key in visited_goals:
                trace.append(f"{indent}[CYCLE] Goal '{target_name}'={target_val} already in evaluation stack.")
                return False
            visited_goals.add(goal_key)

            # Base Case 1: Already known in facts
            if target_name in known_facts:
                match = known_facts[target_name].value == target_val
                status = "PROVEN" if match else "REFUTED"
                trace.append(f"{indent}[FACT {status}] '{target_name}'={known_facts[target_name].value} (needed {target_val})")
                visited_goals.remove(goal_key)
                return match

            # Recursive Case: Find rules that conclude target_name == target_val
            matching_rules = [
                r for r in self.rules
                if r.consequent[0] == target_name and r.consequent[1] == target_val
            ]

            if not matching_rules:
                trace.append(f"{indent}[UNPROVABLE] No rule concludes '{target_name}'={target_val}")
                missing_facts.append(target_name)
                visited_goals.remove(goal_key)
                return False

            for rule in matching_rules:
                trace.append(f"{indent}[EVALUATING {rule.rule_id}] Proving sub-goals for '{target_name}': {rule.antecedents}")
                all_subgoals_proven = True

                for ant_name, ant_val in rule.antecedents:
                    if not prove(ant_name, ant_val, depth + 1):
                        all_subgoals_proven = False
                        break

                if all_subgoals_proven:
                    fired_rules.append(rule.rule_id)
                    inferred_fact = Fact(
                        name=target_name,
                        value=target_val,
                        source="inferred",
                        rule_id=rule.rule_id,
                        explanation=rule.explanation,
                    )
                    known_facts[target_name] = inferred_fact
                    trace.append(f"{indent}[RULE SUCCESS {rule.rule_id}] Proven '{target_name}'={target_val}")
                    visited_goals.remove(goal_key)
                    return True

            visited_goals.remove(goal_key)
            return False

        proven = prove(goal_name, goal_val, 0)

        derived_list = [
            {
                "fact": f.name,
                "value": f.value,
                "source": f.source,
                "rule_id": f.rule_id,
                "explanation": f.explanation,
            }
            for f in known_facts.values()
        ]

        return InferenceResult(
            mode="backward",
            goal=f"{goal_name} == {goal_val}",
            success=proven,
            derived_facts=derived_list,
            fired_rules=fired_rules,
            trace=trace,
            missing_facts=list(set(missing_facts)),
            contradictions=[],
        )
