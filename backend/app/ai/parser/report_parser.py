"""
Medical Report Parser to extract parameters and patient details.
"""
import re
from typing import Dict, Any

from app.core.logging import get_logger
from app.ai.parser.medical_entities import ParsedReport, PatientDetails, MedicalParameter

logger = get_logger(__name__)

# Very basic dictionary for matching medical parameters for this Phase
KNOWN_PARAMETERS = {
    "Hemoglobin": {"aliases": ["Hb", "Hgb", "Haemoglobin"]},
    "WBC": {"aliases": ["White Blood Cell", "Leukocytes", "TLC"]},
    "RBC": {"aliases": ["Red Blood Cell", "Erythrocytes"]},
    "Platelets": {"aliases": ["PLT", "Thrombocytes"]},
    "Glucose": {"aliases": ["Fasting Blood Sugar", "FBS", "PPBS"]},
    "Cholesterol": {"aliases": ["Total Cholesterol"]},
    "Blood Pressure": {"aliases": ["BP"]}
}

def parse_report_text(text: str) -> ParsedReport:
    """
    Parse OCR text into structured medical entities.
    """
    logger.info("healthlens.parser.started")
    
    patient = PatientDetails()
    parameters = []
    abnormal_values = []
    
    # 1. Simple heuristic for patient details (Name, Age, Gender, Date)
    # This is a stub for an NLP-based extraction
    lines = text.split("\n")
    for i, line in enumerate(lines[:20]): # Check first 20 lines for patient info
        if "name:" in line.lower() or "patient:" in line.lower():
            patient.name = line.split(":")[-1].strip()
        elif "age:" in line.lower():
            age_match = re.search(r"(\d+)", line)
            if age_match:
                patient.age = age_match.group(1)
        elif "gender:" in line.lower() or "sex:" in line.lower():
            if "male" in line.lower() and "female" not in line.lower():
                patient.gender = "Male"
            elif "female" in line.lower():
                patient.gender = "Female"
        elif "date:" in line.lower():
            # A simple date regex
            date_match = re.search(r"(\d{2}[/-]\d{2}[/-]\d{2,4})", line)
            if date_match:
                patient.report_date = date_match.group(1)
    
    # 2. Extract medical parameters
    for param_name, data in KNOWN_PARAMETERS.items():
        search_terms = [param_name] + data["aliases"]
        for term in search_terms:
            for line in lines:
                if re.search(rf"\b{re.escape(term)}\b", line, re.IGNORECASE):
                    # Find first number
                    nums = re.findall(r"\d+\.\d+|\d+", line)
                    if nums:
                        try:
                            val = float(nums[0])
                            
                            # Simple dummy status for demo parsing
                            status = "normal"
                            if param_name == "Hemoglobin" and (val < 12.0 or val > 17.5):
                                status = "low" if val < 12.0 else "high"
                                abnormal_values.append(param_name)
                                
                            param = MedicalParameter(
                                name=param_name,
                                value=val,
                                status=status
                            )
                            parameters.append(param)
                            break
                        except ValueError:
                            continue
                            
    logger.info("healthlens.parser.completed", params_found=len(parameters))
    return ParsedReport(
        patient=patient,
        parameters=parameters,
        abnormal_values=abnormal_values,
        summary=f"Found {len(parameters)} parameters, {len(abnormal_values)} abnormal."
    )
