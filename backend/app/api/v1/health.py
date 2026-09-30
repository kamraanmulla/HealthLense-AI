"""
HealthLens AI — Health Check Router
=====================================
Lightweight endpoint for load-balancer and monitoring health probes.
Requires no authentication.
"""

from __future__ import annotations

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_active_user, get_db
from app.core.config import get_settings
from app.models.report import Report, ReportParameter
from app.models.user import User
from app.schemas.common import HealthCheck
from app.services.health.reference_ranges import get_reference_ranges

settings = get_settings()

class TrendPoint(BaseModel):
    report_id: str
    date: datetime
    value: float
    status: str
    unit: Optional[str] = None
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    reference_range: Optional[str] = None

class ParameterTrendResponse(BaseModel):
    parameter: str
    canonical_name: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    reference_min: Optional[float] = None
    reference_max: Optional[float] = None
    latest_value: Optional[float] = None
    latest_date: Optional[datetime] = None
    total_measurements: int = 0
    trend: str  # "no_data", "single_result", "improving", "worsening", "stable"
    points: List[TrendPoint]

router = APIRouter()


@router.get(
    "",
    response_model=HealthCheck,
    summary="Service health check",
    description="Returns the current service status. Used by load-balancers and monitoring tools.",
)
def health_check() -> HealthCheck:
    """Return application health status."""
    return HealthCheck(
        status="ok",
        version=settings.app_version,
        environment=settings.environment,
    )


@router.get(
    "/trends/{parameter}",
    response_model=ParameterTrendResponse,
    summary="Get individual parameter trend",
)
def get_parameter_trend(
    parameter: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> ParameterTrendResponse:
    """Authoritative endpoint for parameter history, clinical reference range, and trend analysis."""
    
    # 1. Resolve canonical name and aliases from clinical reference database
    ref_ranges = get_reference_ranges()
    canonical_name = None
    matched_names = {parameter.strip().lower()}
    
    for key, ref in ref_ranges.items():
        if key.lower() == parameter.strip().lower() or parameter.strip().lower() in [a.lower() for a in ref.get("aliases", [])]:
            canonical_name = key
            matched_names.add(key.lower())
            for a in ref.get("aliases", []):
                matched_names.add(a.lower())
            break
            
    if not canonical_name:
        canonical_name = parameter.strip()
        
    known_ref = ref_ranges.get(canonical_name)
    default_unit = known_ref.get("unit") if known_ref else None
    default_min = known_ref.get("min") if known_ref else None
    default_max = known_ref.get("max") if known_ref else None

    # 2. Fetch user's completed, non-deleted reports ordered chronologically
    reports = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id,
            Report.status == "completed",
            Report.is_deleted == False,
        )
        .order_by(Report.created_at.asc())
        .all()
    )
    
    report_ids = [r.id for r in reports]
    if not report_ids:
        ref_str = f"{default_min} - {default_max} {default_unit}".strip() if (default_min is not None and default_max is not None) else None
        return ParameterTrendResponse(
            parameter=parameter,
            canonical_name=canonical_name,
            unit=default_unit,
            reference_range=ref_str,
            reference_min=default_min,
            reference_max=default_max,
            latest_value=None,
            latest_date=None,
            total_measurements=0,
            trend="no_data",
            points=[],
        )
        
    # 3. Fetch parameter matching candidate names across reports
    raw_params = (
        db.query(ReportParameter)
        .filter(
            ReportParameter.report_id.in_(report_ids),
            func.lower(ReportParameter.name).in_(list(matched_names)),
        )
        .all()
    )
    
    # Create report date map
    date_map = {r.id: r.created_at for r in reports}
    
    # Deduplicate: if a report contains multiple matches, pick one with valid value
    report_to_param: dict[str, ReportParameter] = {}
    for p in raw_params:
        if p.value is not None:
            if p.report_id not in report_to_param or (p.confidence_score or 0) > (report_to_param[p.report_id].confidence_score or 0):
                report_to_param[p.report_id] = p
                
    # Sort chronologically by report date
    sorted_reports = [r for r in reports if r.id in report_to_param]
    
    points: List[TrendPoint] = []
    unit = default_unit
    ref_min = default_min
    ref_max = default_max
    ref_text = None
    
    for r in sorted_reports:
        p = report_to_param[r.id]
        if p.unit and not unit:
            unit = p.unit
        if p.reference_min is not None:
            ref_min = p.reference_min
        if p.reference_max is not None:
            ref_max = p.reference_max
        if p.reference_text:
            ref_text = p.reference_text
            
        p_ref_str = (
            f"{p.reference_min} - {p.reference_max} {p.unit or ''}".strip()
            if (p.reference_min is not None and p.reference_max is not None)
            else (p.reference_text or None)
        )
        
        points.append(
            TrendPoint(
                report_id=p.report_id,
                date=date_map[p.report_id],
                value=p.value,
                status=p.status or "normal",
                unit=p.unit or unit,
                reference_min=p.reference_min if p.reference_min is not None else ref_min,
                reference_max=p.reference_max if p.reference_max is not None else ref_max,
                reference_range=p_ref_str,
            )
        )
        
    # Build formatted reference range string
    if ref_min is not None and ref_max is not None:
        ref_range_str = f"{ref_min} - {ref_max} {unit or ''}".strip()
    elif ref_text:
        ref_range_str = ref_text
    else:
        ref_range_str = None
        
    total_measurements = len(points)
    latest_value = points[-1].value if points else None
    latest_date = points[-1].date if points else None
    
    # 4. Strict Trend Determination
    if total_measurements == 0:
        trend = "no_data"
    elif total_measurements == 1:
        trend = "single_result"
    else:
        first_val = points[0].value
        last_val = points[-1].value
        
        if ref_min is not None and ref_max is not None:
            midpoint = (ref_min + ref_max) / 2.0
            first_dist = abs(first_val - midpoint)
            last_dist = abs(last_val - midpoint)
            
            # If both are comfortably in normal range, it is stable
            if ref_min <= first_val <= ref_max and ref_min <= last_val <= ref_max:
                trend = "stable"
            elif last_dist < first_dist * 0.95:
                trend = "improving"
            elif last_dist > first_dist * 1.05:
                trend = "worsening"
            else:
                trend = "stable"
        else:
            diff_pct = (last_val - first_val) / max(abs(first_val), 1e-6)
            if abs(diff_pct) < 0.05:
                trend = "stable"
            elif diff_pct > 0:
                trend = "worsening"
            else:
                trend = "improving"

    return ParameterTrendResponse(
        parameter=parameter,
        canonical_name=canonical_name,
        unit=unit,
        reference_range=ref_range_str,
        reference_min=ref_min,
        reference_max=ref_max,
        latest_value=latest_value,
        latest_date=latest_date,
        total_measurements=total_measurements,
        trend=trend,
        points=points,
    )

