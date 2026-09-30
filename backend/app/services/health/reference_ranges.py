"""
HealthLens AI — Reference Ranges
==================================
Comprehensive list of medical reference ranges.
Loaded dynamically by the parameter extractor.
"""

from __future__ import annotations

from typing import Any, Dict

# Reference ranges for common laboratory parameters.
# In a real-world scenario, these might differ by age and biological sex.
# For educational purposes, these are generalized adult ranges.
REFERENCE_RANGES: Dict[str, Dict[str, Any]] = {
    "Hemoglobin": {"min": 12.0, "max": 17.5, "unit": "g/dL", "aliases": ["Hb", "Hgb", "Haemoglobin"]},
    "RBC": {"min": 4.1, "max": 5.9, "unit": "mill/µL", "aliases": ["Red Blood Cell", "Erythrocytes"]},
    "WBC": {"min": 4.0, "max": 11.0, "unit": "thou/µL", "aliases": ["White Blood Cell", "Leukocytes", "TLC"]},
    "Platelets": {"min": 150.0, "max": 450.0, "unit": "thou/µL", "aliases": ["PLT", "Thrombocytes"]},
    "MCV": {"min": 80.0, "max": 100.0, "unit": "fL", "aliases": ["Mean Corpuscular Volume"]},
    "MCH": {"min": 27.0, "max": 33.0, "unit": "pg", "aliases": ["Mean Corpuscular Hemoglobin"]},
    "MCHC": {"min": 32.0, "max": 36.0, "unit": "g/dL", "aliases": []},
    "HbA1c": {"min": 4.0, "max": 5.6, "unit": "%", "aliases": ["Glycated Hemoglobin"]},
    "Glucose (Fasting)": {"min": 70.0, "max": 99.0, "unit": "mg/dL", "aliases": ["Fasting Blood Sugar", "FBS"]},
    "Glucose (Postprandial)": {"min": 70.0, "max": 140.0, "unit": "mg/dL", "aliases": ["PPBS"]},
    "Creatinine": {"min": 0.6, "max": 1.2, "unit": "mg/dL", "aliases": ["Serum Creatinine", "Cr"]},
    "Urea": {"min": 15.0, "max": 40.0, "unit": "mg/dL", "aliases": ["Blood Urea Nitrogen", "BUN"]}, # Note BUN/Urea differ, simplified here
    "Uric Acid": {"min": 3.5, "max": 7.2, "unit": "mg/dL", "aliases": ["Serum Uric Acid"]},
    "Total Cholesterol": {"min": 125.0, "max": 200.0, "unit": "mg/dL", "aliases": ["Cholesterol"]},
    "HDL": {"min": 40.0, "max": 60.0, "unit": "mg/dL", "aliases": ["High-Density Lipoprotein"]},
    "LDL": {"min": 50.0, "max": 100.0, "unit": "mg/dL", "aliases": ["Low-Density Lipoprotein"]},
    "Triglycerides": {"min": 50.0, "max": 150.0, "unit": "mg/dL", "aliases": ["TG", "Trig"]},
    "Sodium": {"min": 135.0, "max": 145.0, "unit": "mEq/L", "aliases": ["Na", "Serum Sodium"]},
    "Potassium": {"min": 3.5, "max": 5.2, "unit": "mEq/L", "aliases": ["K", "Serum Potassium"]},
    "Calcium": {"min": 8.5, "max": 10.2, "unit": "mg/dL", "aliases": ["Ca", "Total Calcium"]},
    "Vitamin D": {"min": 30.0, "max": 100.0, "unit": "ng/mL", "aliases": ["Vit D", "25-OH Vitamin D"]},
    "Vitamin B12": {"min": 200.0, "max": 900.0, "unit": "pg/mL", "aliases": ["Vit B12", "Cobalamin"]},
    "TSH": {"min": 0.4, "max": 4.0, "unit": "µIU/mL", "aliases": ["Thyroid Stimulating Hormone"]},
    "T3": {"min": 80.0, "max": 200.0, "unit": "ng/dL", "aliases": ["Triiodothyronine"]},
    "T4": {"min": 4.5, "max": 12.0, "unit": "µg/dL", "aliases": ["Thyroxine"]},
    "SGOT": {"min": 8.0, "max": 40.0, "unit": "U/L", "aliases": ["AST", "Aspartate Aminotransferase"]},
    "SGPT": {"min": 7.0, "max": 56.0, "unit": "U/L", "aliases": ["ALT", "Alanine Aminotransferase"]},
    "Bilirubin (Total)": {"min": 0.1, "max": 1.2, "unit": "mg/dL", "aliases": ["Total Bilirubin"]},
    "Albumin": {"min": 3.5, "max": 5.0, "unit": "g/dL", "aliases": ["Serum Albumin"]},
    "Total Protein": {"min": 6.0, "max": 8.3, "unit": "g/dL", "aliases": ["Protein"]},
    "Ferritin": {"min": 12.0, "max": 300.0, "unit": "ng/mL", "aliases": ["Serum Ferritin"]},
    "Iron": {"min": 60.0, "max": 170.0, "unit": "µg/dL", "aliases": ["Serum Iron"]},
    "eGFR": {"min": 90.0, "max": 120.0, "unit": "mL/min", "aliases": ["Estimated Glomerular Filtration Rate"]},
}

def get_reference_ranges() -> Dict[str, Dict[str, Any]]:
    """Return the dictionary of reference ranges."""
    return REFERENCE_RANGES
