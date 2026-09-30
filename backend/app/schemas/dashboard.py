"""
HealthLens AI — Dashboard Schemas
=====================================
Pydantic v2 models powering the analytics dashboard.
All values are aggregated server-side and returned in a single request
to minimise round-trips.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ParameterTrendPoint(BaseModel):
    """A single data point in a parameter's historical trend."""
    report_id: str
    date: datetime
    value: float
    status: str  # low | normal | high


class ParameterTrend(BaseModel):
    """Trend data for one parameter across multiple reports."""
    name: str
    unit: Optional[str] = None
    points: List[ParameterTrendPoint] = Field(default_factory=list)


class HealthTimelinePoint(BaseModel):
    """Health score and risk level at a specific point in time."""
    report_id: str
    date: datetime
    health_score: float
    risk_level: str


class RiskDistribution(BaseModel):
    """Count of reports at each risk level."""
    low: int = 0
    moderate: int = 0
    high: int = 0


class ParameterStatusSummary(BaseModel):
    """How many parameters fall in each status bucket across all reports."""
    total: int = 0
    normal: int = 0
    low: int = 0
    high: int = 0


class DashboardStats(BaseModel):
    """Top-level aggregate statistics for the dashboard summary card."""
    total_reports: int = Field(..., description="Total reports uploaded by the user.")
    completed_reports: int = Field(..., description="Reports that finished processing.")
    average_health_score: Optional[float] = Field(None, description="Mean health score across completed reports.")
    latest_health_score: Optional[float] = Field(None, description="Health score of the most recent report.")
    latest_risk_level: Optional[str] = Field(None, description="Risk level of the most recent report.")
    risk_distribution: RiskDistribution = Field(default_factory=RiskDistribution)
    parameter_summary: ParameterStatusSummary = Field(default_factory=ParameterStatusSummary)


class TrendRecord(BaseModel):
    date: str
    value: float

class ParameterTrendAPIResponse(BaseModel):
    parameter: str
    unit: Optional[str] = None
    trend: str
    records: List[TrendRecord] = Field(default_factory=list)


class DashboardResponse(BaseModel):
    """
    Full dashboard payload updated for personalized health intelligence.
    """
    health_score: Optional[float] = None
    risk_level: Optional[str] = None
    profile_completion: int = 0
    health_summary: Optional[str] = None
    attention_required: List[str] = Field(default_factory=list)
    improving_parameters: List[str] = Field(default_factory=list)
    declining_parameters: List[str] = Field(default_factory=list)
    recent_reports: int = 0
    latest_insights: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)

    # Keep these for charts
    stats: DashboardStats
    health_timeline: List[HealthTimelinePoint] = Field(default_factory=list)
    parameter_trends: List[ParameterTrend] = Field(default_factory=list)
