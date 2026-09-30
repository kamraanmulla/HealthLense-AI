"""
HealthLens AI — Parameter Validator
=====================================
Validates extracted parameters to ensure they are biologically plausible
and removes obvious extraction artifacts.
"""

from __future__ import annotations

from typing import Any, Dict, List

from app.core.logging import get_logger

logger = get_logger(__name__)


def validate_parameters(parameters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and filter extracted parameters.
    
    Args:
        parameters: List of extracted parameter dictionaries.
        
    Returns:
        Filtered list of validated parameters.
    """
    valid_params = []
    
    for param in parameters:
        val = param.get("value")
        
        # 1. Null checks
        if val is None:
            continue
            
        # 2. Biological plausibility checks (sanity checks)
        # We don't want a Glucose of 9000 due to an OCR error.
        # A simple heuristic: if a value is more than 10x the max reference range,
        # it's highly likely an OCR error (e.g. reading 10.0 as 100).
        # We parse the reference range to find the max.
        
        ref_range_str = param.get("reference_range", "")
        if "–" in ref_range_str: # using the dash we used in parameter_extractor
            try:
                _, max_val_str = ref_range_str.split("–")
                max_val = float(max_val_str)
                
                if val > (max_val * 15): # Allow some leeway for severe conditions, but cap at 15x
                    logger.warning(
                        "health.validator.implausible_value", 
                        parameter=param["parameter_name"], 
                        value=val
                    )
                    continue
            except (ValueError, TypeError):
                pass
                
        # 3. Negative values check (most blood parameters cannot be negative)
        if val < 0:
            logger.warning(
                "health.validator.negative_value", 
                parameter=param["parameter_name"], 
                value=val
            )
            continue
            
        valid_params.append(param)
        
    return valid_params
