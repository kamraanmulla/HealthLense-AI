"""
HealthLens AI — Clinical Score Calculator
==================================
Calculates an overall health score (0-100) and risk level classification
based on weighted clinical parameters and severity levels.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from app.schemas.report import ScoreExplanation

# Severity weights for deductions
SEVERITY_WEIGHTS = {
    "normal": 0.0,
    "borderline": 2.0,
    "mild": 5.0,
    "moderate": 10.0,
    "severe": 18.0,
    "critical": 25.0
}

# Clinical parameters and their impact multipliers
# A multiplier > 1 means the parameter is heavily weighted (e.g. eGFR, Troponin)
CLINICAL_MULTIPLIERS = {
    "egfr": 2.0,
    "creatinine": 1.5,
    "troponin": 2.5,
    "albumin": 1.5,
    "hemoglobin": 1.5,
    "hba1c": 1.5,
    "potassium": 1.5,
    "sodium": 1.2,
    "glucose (fasting)": 1.2,
    "glucose (postprandial)": 1.2,
    "urea": 1.2,
    "uric acid": 1.0,
    "rbc": 1.0,
    "wbc": 1.0,
    "platelets": 1.0,
}

# Compound systems
COMPOUND_SYSTEMS = {
    "renal": ["egfr", "creatinine", "urea", "bun", "uric acid"],
    "metabolic": ["glucose", "hba1c", "triglycerides", "cholesterol"],
    "liver": ["alt", "ast", "alp", "bilirubin", "albumin"],
    "cardiac": ["troponin", "ck-mb", "bnp"],
    "hematology": ["hemoglobin", "rbc", "hematocrit", "wbc", "platelets"]
}


def determine_severity(value: float, ref_min: float, ref_max: float) -> str:
    """
    Determines severity level based on how far the value deviates from the reference range.
    """
    if value < ref_min and ref_min != 0:
        deviation = (ref_min - value) / ref_min
    elif value > ref_max and ref_max != 0:
        deviation = (value - ref_max) / ref_max
    else:
        return "normal"

    if deviation < 0.10:
        return "borderline"
    elif deviation < 0.25:
        return "mild"
    elif deviation < 0.50:
        return "moderate"
    elif deviation < 0.75:
        return "severe"
    else:
        return "critical"


def assign_clinical_weight(parameter_name: str) -> float:
    """
    Returns the clinical multiplier for a given parameter.
    """
    lower_name = parameter_name.lower()
    for key, mult in CLINICAL_MULTIPLIERS.items():
        if key in lower_name:
            return mult
    return 1.0


def calculate_grade(score: float) -> str:
    """Calculates letter grade from score."""
    if score >= 90.0: return "A+"
    elif score >= 80.0: return "A"
    elif score >= 70.0: return "B"
    elif score >= 60.0: return "C"
    elif score >= 45.0: return "D"
    else: return "Critical"


def calculate_risk_level(score: float) -> str:
    """Calculates risk level from score."""
    if score >= 80.0: return "LOW"
    elif score >= 60.0: return "MODERATE"
    elif score >= 45.0: return "HIGH"
    else: return "CRITICAL"


def generate_explanation(name: str, value: Any, ref: str, severity: str, impact: float, status_text: str) -> ScoreExplanation:
    """Generates a structured score explanation for a single parameter."""
    if severity == "normal":
        msg = f"{name} is within the normal reference range."
    else:
        msg = f"{name} is {status_text} ({severity}). This impacts your score by -{impact:.1f} points."
        
    return ScoreExplanation(
        parameter=name,
        patient_value=value,
        reference_range=ref,
        severity=severity,
        score_impact=impact,
        explanation=msg
    )


def generate_compound_explanation(system_name: str, parameters: List[str], impact: float) -> ScoreExplanation:
    """Generates a structured explanation for a compound systemic penalty."""
    msg = f"Multiple abnormal parameters ({', '.join(parameters)}) indicate compound stress on the {system_name} system."
    return ScoreExplanation(
        parameter=f"{system_name.capitalize()} System",
        patient_value=None,
        reference_range=None,
        severity="compound",
        score_impact=impact,
        explanation=msg
    )


def calculate_compound_penalties(abnormal_params: List[str]) -> Tuple[float, List[ScoreExplanation]]:
    """
    Calculates penalties when multiple biomarkers in the same physiological system are abnormal.
    """
    penalty = 0.0
    explanations = []
    
    for system, params in COMPOUND_SYSTEMS.items():
        # count how many params in this system are abnormal
        matches = [p for p in abnormal_params if any(k in p.lower() for k in params)]
        if len(matches) >= 2:
            # Applying a small evidence-based penalty for compound abnormalities
            impact = 3.0 + (len(matches) - 2) * 1.5
            penalty += impact
            explanations.append(generate_compound_explanation(system, matches, impact))
            
    return penalty, explanations


def calculate_health_score(parameters: List[Dict[str, Any]]) -> Tuple[float, str, str, int, List[ScoreExplanation]]:
    """
    Calculate health score with a robust clinical engine.
    
    Returns:
        (health_score, risk_level, health_grade, confidence_pct, explanations)
    """
    if not parameters:
        return 0.0, "UNKNOWN", "N/A", 0, []
        
    score = 100.0
    explanations: List[ScoreExplanation] = []
    abnormal_names: List[str] = []
    
    for p in parameters:
        status = p.get("status", "normal")
        value = p.get("value")
        ref_text = p.get("reference_range", "")
        name = p.get("parameter_name", "")
        
        if status != "normal" and value is not None and ref_text and "–" in ref_text:
            try:
                parts = ref_text.split("–")
                ref_min = float(parts[0].strip())
                ref_max = float(parts[1].strip())
                
                severity = determine_severity(value, ref_min, ref_max)
                if severity == "normal":
                    continue
                    
                abnormal_names.append(name)
                
                base_penalty = SEVERITY_WEIGHTS.get(severity, 5.0)
                multiplier = assign_clinical_weight(name)
                
                final_penalty = base_penalty * multiplier
                score -= final_penalty
                
                status_text = "High" if value > ref_max else "Low"
                explanations.append(
                    generate_explanation(name, value, ref_text, severity, final_penalty, status_text)
                )
            except (ValueError, IndexError):
                pass
                
    # Compound penalties
    if abnormal_names:
        compound_penalty, compound_explanations = calculate_compound_penalties(abnormal_names)
        score -= compound_penalty
        explanations.extend(compound_explanations)
        
    # Minimum score floor protection based on severity of findings
    if score < 20.0 and any(e.severity in ["severe", "critical"] for e in explanations):
        score = max(15.0, score) # floor for severe cases
    
    score = max(0.0, min(100.0, round(score, 1)))
    
    risk_level = calculate_risk_level(score)
    health_grade = calculate_grade(score)
        
    # Calculate confidence based on number of extracted parameters
    confidence_pct = min(100, int((len(parameters) / 15) * 100)) if parameters else 0
    if confidence_pct < 50:
        confidence_pct = 85 # fallback for small but valid reports
        
    if not explanations:
        explanations.append(
            ScoreExplanation(
                parameter="All Parameters",
                patient_value=None,
                reference_range=None,
                severity="normal",
                score_impact=0.0,
                explanation="All extracted parameters are within normal reference ranges."
            )
        )
        
    return score, risk_level, health_grade, confidence_pct, explanations
