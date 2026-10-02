"""
HealthLens AI — Report Schemas
=================================
Pydantic v2 models for the medical report pipeline:
  • Upload request / response
  • Individual parameter representation
  • AI analysis result
  • Full report detail
  • List/paginated report response
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Parameter schemas ─────────────────────────────────────────────────────────

class ParameterStatus(str):
    """Allowed values for a parameter's status relative to the reference range."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


class ReportParameterBase(BaseModel):
    """Shared fields for a blood parameter."""
    name: str = Field(..., description="Parameter name, e.g. 'Haemoglobin'.")
    value: Optional[float] = Field(None, description="Numeric extracted value.")
    unit: Optional[str] = Field(None, description="Unit of measurement, e.g. 'g/dL'.")
    reference_min: Optional[float] = Field(None, description="Lower bound of reference range.")
    reference_max: Optional[float] = Field(None, description="Upper bound of reference range.")
    reference_text: Optional[str] = Field(None, description="Human-readable range, e.g. '12.0–16.0'.")
    status: str = Field("normal", description="'low' | 'normal' | 'high'.")
    confidence_score: Optional[float] = Field(None, description="OCR extraction confidence 0.0-1.0")

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v: str) -> str:
        allowed = {"low", "normal", "high"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}.")
        return v


class ReportParameterResponse(ReportParameterBase):
    """Parameter as returned by the API."""
    id: int

    model_config = {"from_attributes": True}


# ── AI result schema ──────────────────────────────────────────────────────────

class HealthInsight(BaseModel):
    insight: str

class Recommendation(BaseModel):
    recommendation: str

class AbnormalParameter(BaseModel):
    test_name: str
    result: float | str | None = None
    range: str | None = None
    status: str

class ScoreExplanation(BaseModel):
    parameter: str
    patient_value: float | str | None = None
    reference_range: str | None = None
    severity: str
    score_impact: float
    explanation: str

class Condition(BaseModel):
    id: str
    name: str
    confidence: float
    severity: str
    evidence: List[str]
    explanation: str
    recommended_specialist: str
    urgency: str
    recommended_tests: List[str]

class AIHealthSummary(BaseModel):
    overall_summary: str
    key_findings: List[str]
    lifestyle_recommendations: List[str]
    dietary_guidance: List[str]
    doctor_discussion_points: List[str]
    medical_disclaimer: str

class LongitudinalChange(BaseModel):
    parameter: str
    current_value: float
    previous_value: Optional[float] = None
    absolute_change: Optional[float] = None
    percentage_change: Optional[float] = None
    direction: Optional[str] = None
    number_of_previous_reports: Optional[int] = 0

class MLAnomalyDetectionResult(BaseModel):
    """Structured ML Isolation Forest anomaly detection findings."""
    anomaly_detected: bool = Field(False, description="Whether an unusual multivariable pattern was detected")
    anomaly_level: str = Field("normal", description="'normal' | 'low' | 'medium' | 'high' | 'unavailable'")
    anomaly_score: Optional[float] = Field(None, description="Calibrated anomaly severity score 0.0 to 1.0")
    affected_parameters: List[str] = Field(default_factory=list, description="Parameters that contribute to the unusual pattern")
    reason: str = Field(..., description="Educational explanation of the pattern")
    model_version: str = Field("1.0.0", description="Version of the trained anomaly model")
    analysis_type: str = Field("population_anomaly_detection", description="Analysis category")
    parameters_analyzed: List[str] = Field(default_factory=list, description="Supported parameters evaluated by the model")
    longitudinal_changes: Optional[List[LongitudinalChange]] = Field(default_factory=list, description="Longitudinal parameter trends")
    disclaimer: str = Field(
        "This pattern analysis is informational and is not a medical diagnosis.",
        description="Clinical disclaimer"
    )

class AIAnalysisResult(BaseModel):
    """
    Structured AI output.

    The AI service is required to return exactly this shape.
    All free-text fields are educational explanations — not diagnoses.
    """
    health_score: float = Field(
        ..., ge=0.0, le=100.0,
        description="Calculated wellness score (0 = poor, 100 = excellent)."
    )
    health_grade: Optional[str] = Field(None, description="A+, A, B, C, D, Critical")
    risk_level: str = Field(
        ...,
        description="'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' — educational classification."
    )
    confidence_pct: Optional[int] = Field(None, description="Confidence percentage")
    score_explanation: Optional[List[ScoreExplanation | str]] = Field(None, description="Detailed explanation of score deductions")
    summary: str = Field(
        ...,
        description="Plain-language overview of the report. Educational only."
    )
    patient_info: Dict[str, Any] = Field(default_factory=dict)
    detected_diseases: List[str] = Field(default_factory=list)
    detected_conditions: Optional[List[Condition]] = Field(default_factory=list)
    ml_anomaly_detection: Optional[MLAnomalyDetectionResult] = None
    ai_health_summary: Optional[AIHealthSummary] = None
    top_risks: List[str] = Field(default_factory=list)
    abnormal_parameters: List[AbnormalParameter] = Field(
        default_factory=list,
        description="List of abnormal parameters with details."
    )
    personalized_health_insights: List[HealthInsight] = Field(
        default_factory=list,
        description="Educational insights explaining what the results may indicate."
    )
    lifestyle_advice: List[str] = Field(default_factory=list)
    diet_suggestions: List[str] = Field(default_factory=list)
    exercise_suggestions: List[str] = Field(default_factory=list)
    recommendations: List[Recommendation] = Field(
        default_factory=list,
        description="Lifestyle suggestions (no medications or diagnoses)."
    )
    immediate_attention: List[str] = Field(default_factory=list)
    doctor_recommendation: Optional[str] = Field(None)
    follow_up_tests: List[str] = Field(default_factory=list)
    long_term_monitoring: List[str] = Field(default_factory=list)
    preventive_advice: List[str] = Field(default_factory=list)
    data_foundation: Optional[Dict[str, Any]] = None
    rule_engine_findings: Optional[Dict[str, Any]] = None
    knowledge_graph_context: Optional[List[Dict[str, Any]]] = None

    @field_validator("risk_level")
    @classmethod
    def risk_level_must_be_valid(cls, v: str) -> str:
        allowed = {"LOW", "MODERATE", "HIGH", "CRITICAL"}
        if v.upper() not in allowed:
            raise ValueError(f"risk_level must be one of {allowed}.")
        return v.upper()


# ── Report schemas ────────────────────────────────────────────────────────────

class ReportListItem(BaseModel):
    """Compact report representation for list/history endpoints."""
    id: str
    original_filename: str
    file_type: str
    status: str
    health_score: Optional[float] = None
    risk_level: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportDetailResponse(BaseModel):
    """
    Full report detail including all parameters and the AI result.

    Returned by GET /api/v1/reports/{report_id}.
    """
    id: str
    user_id: int
    original_filename: str
    file_type: str
    file_size_bytes: int
    status: str
    error_message: Optional[str] = None
    health_score: Optional[float] = None
    health_grade: Optional[str] = None
    risk_level: Optional[str] = None
    confidence_pct: Optional[int] = None
    ai_result: Optional[AIAnalysisResult] = None
    parameters: List[ReportParameterResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReportUploadResponse(BaseModel):
    """Immediate response when a file is accepted for processing."""
    id: str = Field(..., description="Report UUID — poll this ID for status updates.")
    status: str = Field("pending", description="Initial processing status.")
    message: str = Field("Report uploaded successfully. Processing has begun.")


class ReportStatusResponse(BaseModel):
    """Lightweight status-check response."""
    id: str
    status: str
    health_score: Optional[float] = None
    health_grade: Optional[str] = None
    risk_level: Optional[str] = None
    confidence_pct: Optional[int] = None
    error_message: Optional[str] = None
    progress: Optional[int] = None
    processing_stage: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Chat schemas ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    disclaimer: str
