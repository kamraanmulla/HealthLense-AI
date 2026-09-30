"""
HealthLens AI — Parameter Extractor
=====================================
Extracts medical parameters from cleaned OCR text.
Uses regular expressions to match parameter names and values.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

from app.core.logging import get_logger
from app.services.health.reference_ranges import get_reference_ranges

logger = get_logger(__name__)


def extract_parameters(text: str) -> List[Dict[str, Any]]:
    """
    Extract medical parameters from text using a multi-pass parsing strategy.
    Correctly isolates patient values from reference ranges and calculates confidence.
    """
    ranges = get_reference_ranges()
    extracted = []
    
    lines = text.split("\n")
    
    for param_name, param_data in ranges.items():
        search_terms = [param_name] + param_data.get("aliases", [])
        
        best_match = None
        best_confidence = 0.0
        
        for term in search_terms:
            for line in lines:
                # 1. Look for the parameter name
                match = re.search(rf"\b{re.escape(term)}\b", line, re.IGNORECASE)
                if not match:
                    continue
                    
                confidence = 0.70  # Base confidence for finding the term
                
                # If exact case matches, slight bump
                if term in line:
                    confidence += 0.05
                    
                remainder = line[match.end():]
                
                # 2. Identify and mask out reference ranges (e.g. 12.0-16.0, 4.5 - 5.5, 15 to 40)
                # This prevents the regex from picking up the reference range numbers as the patient value
                range_pattern = r"(\d+\.?\d*)\s*(?:-|–|to)\s*(\d+\.?\d*)"
                
                # Check if the expected unit is on this line
                unit = param_data.get("unit", "")
                if unit and re.search(rf"\b{re.escape(unit)}\b", remainder, re.IGNORECASE):
                    confidence += 0.15
                    # Mask out the unit so we don't accidentally parse numbers inside unit strings
                    remainder = re.sub(rf"\b{re.escape(unit)}\b", " [UNIT] ", remainder, flags=re.IGNORECASE)
                    
                # Mask out the range
                range_matches = re.findall(range_pattern, remainder)
                if range_matches:
                    confidence += 0.05 # We found a range on the same line, highly likely this is the right line
                    remainder = re.sub(range_pattern, " [RANGE] ", remainder)
                    
                # 3. Extract the first remaining number as the patient value
                numbers = re.findall(r"\d+\.\d+|\d+", remainder)
                
                matched_val = None
                for n_str in numbers:
                    try:
                        v = float(n_str)
                        # Ignore standalone years
                        if 1900 <= v <= 2100 and "." not in n_str and len(n_str) == 4:
                            continue
                        matched_val = v
                        break
                    except ValueError:
                        continue
                        
                if matched_val is not None:
                    # Normalize units if reported in absolute cell counts instead of thousands
                    if param_name == "WBC" and matched_val >= 100:
                        matched_val = round(matched_val / 1000.0, 2)
                    elif param_name == "Platelets" and matched_val >= 1000:
                        matched_val = round(matched_val / 1000.0, 1)

                    # Found a value
                    # Calculate status
                    status = "normal"
                    if matched_val < param_data["min"]:
                        status = "low"
                    elif matched_val > param_data["max"]:
                        status = "high"
                        
                    # Cap confidence at 1.0
                    confidence = min(1.0, confidence)
                    
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_match = {
                            "parameter_name": param_name,
                            "value": matched_val,
                            "unit": param_data["unit"],
                            "reference_range": f"{param_data['min']}–{param_data['max']}",
                            "status": status,
                            "confidence_score": round(confidence, 2)
                        }
                        
        if best_match:
            extracted.append(best_match)

    logger.info("health.parameter_extractor.completed", count=len(extracted))
    return extracted
