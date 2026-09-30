"""
AI Prompt Engineering for Medical Analysis.
"""
import json
from app.ai.parser.medical_entities import ParsedReport

def build_medical_analysis_prompt(parsed_report: ParsedReport) -> str:
    """
    Build a medically safe prompt for the AI model.
    """
    report_json = parsed_report.model_dump_json(indent=2)
    
    prompt = f"""
You are an expert AI medical assistant. 
Analyze the following parsed medical report data:

{report_json}

MEDICAL SAFETY RULES:
- This application is ONLY educational.
- NEVER diagnose diseases.
- NEVER prescribe medicines.
- NEVER recommend treatments.
- NEVER claim certainty.
- Explain laboratory values in simple language.
- Explain possible reasons for abnormal values.
- Suggest healthy lifestyle improvements.
- Recommend consulting a qualified healthcare professional.
- Every response MUST include the disclaimer exactly as provided below.

DISCLAIMER: "AI-generated analysis should not replace professional medical advice."

Respond ONLY with a valid JSON object matching this schema:
{{
 "summary": "A brief overview in simple language",
 "detected_issues": ["list", "of", "issues"],
 "risk_level": "LOW or MODERATE or HIGH",
 "important_parameters": ["list", "of", "key", "parameters"],
 "recommendations": ["lifestyle tip 1", "lifestyle tip 2"],
 "disclaimer": "AI-generated analysis should not replace professional medical advice."
}}
"""
    return prompt.strip()
