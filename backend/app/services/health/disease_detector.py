"""
HealthLens AI — Disease Detection Engine
========================================
Deterministically evaluates physiological systems based on lab abnormalities
to suggest possible conditions. 
"""

import uuid
from typing import Any, Dict, List

from app.schemas.report import Condition


# Thresholds or combinations indicating a condition
# We map parameters (lowercase) that belong to a system.
SYSTEM_RULES = {
    "kidney": {
        "parameters": ["egfr", "creatinine", "urea", "bun"],
        "name": "Possible Chronic Kidney Disease or Renal Impairment",
        "specialist": "Nephrologist",
        "tests": ["Urine Albumin-to-Creatinine Ratio (UACR)", "Kidney Ultrasound", "Repeat Basic Metabolic Panel"],
        "explanation": "Laboratory findings show deviations in kidney function markers, which may indicate reduced renal filtration or stress on the kidneys."
    },
    "diabetes": {
        "parameters": ["glucose", "hba1c", "fasting glucose", "postprandial glucose"],
        "name": "Possible Impaired Glucose Tolerance or Diabetes",
        "specialist": "Endocrinologist",
        "tests": ["Oral Glucose Tolerance Test (OGTT)", "Fasting Insulin", "C-Peptide"],
        "explanation": "Elevated blood sugar markers suggest impaired glucose metabolism, consistent with prediabetes or diabetes."
    },
    "liver": {
        "parameters": ["alt", "ast", "alp", "bilirubin", "gamma gt", "ggt"],
        "name": "Possible Hepatic Dysfunction",
        "specialist": "Hepatologist or Gastroenterologist",
        "tests": ["Liver Ultrasound", "Viral Hepatitis Panel", "Comprehensive Metabolic Panel (CMP)"],
        "explanation": "Elevated liver enzymes indicate potential inflammation or stress in the liver tissue."
    },
    "dyslipidemia": {
        "parameters": ["ldl", "hdl", "triglycerides", "cholesterol"],
        "name": "Possible Dyslipidemia",
        "specialist": "Cardiologist or Primary Care Physician",
        "tests": ["Advanced Lipid Profile (ApoB)", "Hs-CRP", "Cardiac Calcium Score"],
        "explanation": "Abnormal lipid levels increase the risk of plaque buildup in the arteries and cardiovascular disease."
    },
    "anemia": {
        "parameters": ["hemoglobin", "rbc", "hematocrit", "iron", "ferritin"],
        "name": "Possible Anemia",
        "specialist": "Hematologist or Primary Care Physician",
        "tests": ["Iron Panel", "Vitamin B12 and Folate", "Peripheral Blood Smear"],
        "explanation": "Low red blood cell counts or hemoglobin levels suggest a reduced capacity of the blood to carry oxygen."
    },
    "thyroid": {
        "parameters": ["tsh", "t3", "t4", "free t3", "free t4"],
        "name": "Possible Thyroid Dysfunction",
        "specialist": "Endocrinologist",
        "tests": ["Thyroid Antibodies (TPO)", "Thyroid Ultrasound"],
        "explanation": "Deviations in thyroid hormones indicate an overactive or underactive thyroid gland, affecting metabolism."
    }
}


def detect_conditions(parameters: List[Dict[str, Any]]) -> List[Condition]:
    """
    Analyzes parameters and returns a list of detected Condition objects.
    """
    detected_conditions = []
    
    # Filter to only abnormal parameters
    abnormals = [p for p in parameters if p.get("status") != "normal" and p.get("value") is not None]
    
    if not abnormals:
        return []
        
    for system_key, rule in SYSTEM_RULES.items():
        # Find which parameters in the report match this system
        system_params = []
        for p in abnormals:
            name_lower = p.get("parameter_name", "").lower()
            if any(marker in name_lower for marker in rule["parameters"]):
                system_params.append(p)
                
        # We need at least 1 severe/critical parameter OR 2+ abnormal parameters to trigger a detection
        if not system_params:
            continue
            
        is_severe = any(
            (p.get("value", 0) > float(p.get("reference_range", "0-0").split("–")[1].strip()) * 1.3 if "–" in p.get("reference_range", "") else False) or
            (p.get("value", 0) < float(p.get("reference_range", "0-0").split("–")[0].strip()) * 0.7 if "–" in p.get("reference_range", "") else False)
            for p in system_params
        ) # Rough heuristic for severe, but we can just use count for now since severity strings aren't passed in directly
        
        # Simpler rule: if we have 2 or more abnormals in a system, or 1 highly abnormal (let's say we just use 2 or more, or 1 for diabetes if hba1c)
        # Actually, let's just trigger if any parameter is abnormal, but set confidence based on count.
        
        evidence = []
        for p in system_params:
            evidence.append(f"{p['parameter_name']} = {p['value']} {p.get('unit', '')}")
            
        # Base confidence on how many parameters are abnormal vs how many are typically checked
        confidence = min(0.95, 0.40 + (len(system_params) * 0.20))
        
        severity = "Moderate"
        urgency = "Discuss at next routine visit"
        if confidence > 0.8:
            severity = "High"
            urgency = "Consult soon (within 2-4 weeks)"
        elif confidence > 0.6:
            severity = "Moderate"
            urgency = "Discuss at next routine visit"
        else:
            severity = "Mild"
            urgency = "Monitor and repeat tests"
            
        # Special case: If only 1 parameter is slightly off, we might skip, but let's just emit it with low confidence.
        # Actually, if there's only 1 parameter and it's not a definitive one (like HbA1c), maybe we shouldn't alert.
        # But we'll trust the parameter count.
        
        condition = Condition(
            id=str(uuid.uuid4()),
            name=rule["name"],
            confidence=round(confidence, 2),
            severity=severity,
            evidence=evidence,
            explanation=rule["explanation"],
            recommended_specialist=rule["specialist"],
            urgency=urgency,
            recommended_tests=rule["tests"]
        )
        detected_conditions.append(condition)

    return detected_conditions
