"""
Medical Entities for Parser output validation.
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class PatientDetails(BaseModel):
    name: Optional[str] = Field(None, description="Name of the patient")
    age: Optional[str] = Field(None, description="Age of the patient")
    gender: Optional[str] = Field(None, description="Gender of the patient")
    report_date: Optional[str] = Field(None, description="Date the report was generated")

class MedicalParameter(BaseModel):
    name: str = Field(..., description="Parameter name (e.g., Hemoglobin)")
    value: float = Field(..., description="Extracted numerical value")
    unit: Optional[str] = Field(None, description="Measurement unit (e.g., g/dL)")
    reference_range: Optional[str] = Field(None, description="Reference range string")
    status: Optional[str] = Field("normal", description="Status: 'normal', 'low', or 'high'")

class ParsedReport(BaseModel):
    """Structured schema returned by the report parser."""
    patient: PatientDetails = Field(default_factory=PatientDetails)
    parameters: List[MedicalParameter] = Field(default_factory=list)
    abnormal_values: List[str] = Field(default_factory=list)
    summary: str = Field("", description="A short summary of the parser's findings")
