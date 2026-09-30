"""
HealthLens AI — Deterministic Recommendation Engine
===================================================
Generates safe, structured, rule-based recommendations based on detected conditions.
Does NOT call Gemini. Does NOT prescribe medication.
"""

from typing import Dict, List, Any
from app.schemas.report import Condition

# Predefined safe recommendations based on condition keys
RECOMMENDATION_RULES = {
    "Possible Chronic Kidney Disease or Renal Impairment": {
        "lifestyle": [
            "Maintain healthy hydration levels as advised by your doctor",
            "Monitor blood pressure regularly",
            "Maintain a healthy weight and avoid smoking"
        ],
        "dietary": [
            "Discuss daily sodium, potassium, and protein intake with a healthcare professional",
            "Avoid excessive use of over-the-counter pain relievers (like NSAIDs) unless advised by a doctor"
        ],
        "doctor": [
            "Review kidney function markers (eGFR, Creatinine) with a nephrologist or primary care provider",
            "Discuss potential underlying causes such as hypertension or diabetes"
        ]
    },
    "Possible Impaired Glucose Tolerance or Diabetes": {
        "lifestyle": [
            "Engage in regular moderate physical activity (e.g., walking 30 mins daily)",
            "Monitor blood glucose levels regularly if advised",
            "Maintain a healthy body weight"
        ],
        "dietary": [
            "Prefer complex carbohydrates and high-fiber foods",
            "Avoid excessive processed sugar and sweetened beverages",
            "Maintain balanced, portion-controlled meals"
        ],
        "doctor": [
            "Discuss long-term glucose management and HbA1c goals with a healthcare professional",
            "Schedule regular eye and foot exams as part of routine care"
        ]
    },
    "Possible Hepatic Dysfunction": {
        "lifestyle": [
            "Avoid alcohol consumption",
            "Maintain a healthy weight",
            "Review all current supplements and over-the-counter medications with a doctor"
        ],
        "dietary": [
            "Maintain a balanced diet rich in vegetables and lean proteins",
            "Limit consumption of highly processed foods"
        ],
        "doctor": [
            "Review liver enzyme levels and potential causes with a gastroenterologist or primary care physician",
            "Discuss if a liver ultrasound is necessary"
        ]
    },
    "Possible Dyslipidemia": {
        "lifestyle": [
            "Incorporate cardiovascular exercise into your weekly routine",
            "Maintain a healthy weight and avoid smoking",
            "Manage stress levels"
        ],
        "dietary": [
            "Reduce intake of saturated and trans fats",
            "Increase intake of omega-3 fatty acids, soluble fiber, and whole grains"
        ],
        "doctor": [
            "Discuss cardiovascular risk factors with your healthcare provider",
            "Review long-term cholesterol management strategies"
        ]
    },
    "Possible Anemia": {
        "lifestyle": [
            "Monitor for symptoms of fatigue or dizziness",
            "Ensure adequate rest"
        ],
        "dietary": [
            "Incorporate iron-rich foods (e.g., leafy greens, lean meats, beans) into your diet",
            "Consume Vitamin C-rich foods to enhance iron absorption"
        ],
        "doctor": [
            "Discuss further testing (such as an Iron Panel or B12/Folate) with your doctor to determine the specific cause",
            "Review any persistent symptoms with a healthcare professional"
        ]
    },
    "Possible Thyroid Dysfunction": {
        "lifestyle": [
            "Maintain a consistent sleep schedule",
            "Manage stress levels effectively"
        ],
        "dietary": [
            "Maintain a balanced diet",
            "Discuss iodine or other supplement usage with a doctor before starting"
        ],
        "doctor": [
            "Review thyroid hormone levels (TSH, T3, T4) with an endocrinologist",
            "Discuss whether medication adjustment or initiation is required"
        ]
    }
}

def generate_recommendations(conditions: List[Condition]) -> Dict[str, List[str]]:
    """
    Generates deterministic recommendations based on a list of detected conditions.
    """
    lifestyle = set()
    dietary = set()
    doctor = set()
    
    for condition in conditions:
        rule = RECOMMENDATION_RULES.get(condition.name)
        if rule:
            lifestyle.update(rule.get("lifestyle", []))
            dietary.update(rule.get("dietary", []))
            doctor.update(rule.get("doctor", []))
            
    # Add general fallback recommendations if nothing specific was found
    if not lifestyle:
        lifestyle.add("Maintain a balanced routine with regular physical activity and adequate sleep.")
    if not dietary:
        dietary.add("Maintain a balanced diet rich in whole foods, vegetables, and lean proteins.")
    if not doctor:
        doctor.add("Discuss your overall laboratory results with a primary care physician to establish a baseline.")
        
    return {
        "lifestyle_recommendations": list(lifestyle),
        "dietary_guidance": list(dietary),
        "doctor_discussion_points": list(doctor)
    }
