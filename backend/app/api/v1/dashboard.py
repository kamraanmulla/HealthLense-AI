"""
HealthLens AI — Dashboard Router
==================================
Aggregates analytics data for the authenticated user and serves it in a
single response to minimise frontend round-trips.

Endpoint
--------
GET /dashboard   → DashboardResponse
"""

from __future__ import annotations

from collections import defaultdict
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.models.report import Report, ReportParameter
from app.models.user import User, UserProfile
from app.schemas.dashboard import (
    DashboardResponse,
    DashboardStats,
    HealthTimelinePoint,
    ParameterStatusSummary,
    ParameterTrend,
    ParameterTrendPoint,
    RiskDistribution,
    ParameterTrendAPIResponse,
    TrendRecord,
)

router = APIRouter()


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get dashboard analytics",
    description=(
        "Returns aggregate statistics, health score timeline, and per-parameter "
        "trend data for the authenticated user. All data is computed server-side."
    ),
)
def get_dashboard(
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    """Build and return the full dashboard payload."""

    # ── Fetch completed, non-deleted reports ordered by date ─────────────────
    all_reports: List[Report] = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id,
            Report.is_deleted == False,  # noqa: E712
        )
        .order_by(Report.created_at.asc())
        .all()
    )

    completed = [r for r in all_reports if r.status == "completed"]

    # ── Aggregate stats ───────────────────────────────────────────────────────
    risk_dist = RiskDistribution()
    for r in completed:
        lvl = (r.risk_level or "").upper()
        if lvl == "LOW":
            risk_dist.low += 1
        elif lvl == "MODERATE":
            risk_dist.moderate += 1
        elif lvl == "HIGH":
            risk_dist.high += 1

    scores = [r.health_score for r in completed if r.health_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None
    latest = completed[-1] if completed else None

    # ── Parameter status summary (across all completed reports) ──────────────
    all_params: List[ReportParameter] = (
        db.query(ReportParameter)
        .join(Report, ReportParameter.report_id == Report.id)
        .filter(
            Report.user_id == current_user.id,
            Report.is_deleted == False,  # noqa: E712
            Report.status == "completed",
        )
        .all()
    )

    param_summary = ParameterStatusSummary(total=len(all_params))
    for p in all_params:
        if p.status == "low":
            param_summary.low += 1
        elif p.status == "high":
            param_summary.high += 1
        else:
            param_summary.normal += 1

    stats = DashboardStats(
        total_reports=len(all_reports),
        completed_reports=len(completed),
        average_health_score=avg_score,
        latest_health_score=latest.health_score if latest else None,
        latest_risk_level=latest.risk_level if latest else None,
        risk_distribution=risk_dist,
        parameter_summary=param_summary,
    )

    # ── Health timeline ───────────────────────────────────────────────────────
    health_timeline = [
        HealthTimelinePoint(
            report_id=r.id,
            date=r.created_at,
            health_score=r.health_score,
            risk_level=r.risk_level or "UNKNOWN",
        )
        for r in completed
        if r.health_score is not None
    ]

    # ── Parameter trends (group by parameter name) ────────────────────────────
    trend_map: dict[str, dict] = defaultdict(lambda: {"unit": None, "points": []})

    for p in all_params:
        if p.value is None:
            continue
        # Find the parent report's date
        report_date = next(
            (r.created_at for r in completed if r.id == p.report_id), None
        )
        if report_date is None:
            continue

        key = p.name
        if trend_map[key]["unit"] is None:
            trend_map[key]["unit"] = p.unit

        trend_map[key]["points"].append(
            ParameterTrendPoint(
                report_id=p.report_id,
                date=report_date,
                value=p.value,
                status=p.status,
            )
        )

    parameter_trends = [
        ParameterTrend(name=name, unit=data["unit"], points=data["points"])
        for name, data in sorted(trend_map.items())
    ]

    # ── Intelligent Enhancements ──────────────────────────────────────────────
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    profile_completion = 0
    if profile:
        fields = [profile.age, profile.gender, profile.height, profile.weight, profile.bmi, profile.medical_conditions, profile.activity_level]
        filled = sum(1 for f in fields if f is not None)
        profile_completion = int((filled / len(fields)) * 100) if len(fields) > 0 else 0

    attention_required = []
    improving_parameters = []
    declining_parameters = []
    
    if len(completed) >= 2:
        last_report = completed[-1]
        prev_report = completed[-2]
        
        last_params = {p.name: p for p in last_report.parameters if p.value is not None}
        prev_params = {p.name: p for p in prev_report.parameters if p.value is not None}
        
        for name, p in last_params.items():
            if p.status != "normal" and name not in attention_required:
                attention_required.append(name)
                
            if name in prev_params:
                prev_val = prev_params[name].value
                # A simple decline/improve metric based on moving towards/away from bounds
                if p.reference_min and p.reference_max:
                    midpoint = (p.reference_min + p.reference_max) / 2
                    prev_dist = abs(prev_val - midpoint)
                    curr_dist = abs(p.value - midpoint)
                    
                    if curr_dist < prev_dist * 0.9:
                        improving_parameters.append(name)
                    elif curr_dist > prev_dist * 1.1:
                        declining_parameters.append(name)
    elif len(completed) == 1:
        last_report = completed[-1]
        attention_required = [p.name for p in last_report.parameters if p.status != "normal"]

    # AI Data from latest report
    ai_summary = None
    insights = []
    recommendations = []
    
    if latest and latest.ai_result:
        ai_summary = latest.ai_result.get("summary")
        insights = latest.ai_result.get("personalized_health_insights", [])
        recs = latest.ai_result.get("recommendations", [])
        if isinstance(recs, list):
            recommendations = recs
        elif isinstance(recs, dict):
            recommendations = [{"category": k, "recommendations": v} for k, v in recs.items()]

    return DashboardResponse(
        health_score=latest.health_score if latest else None,
        risk_level=latest.risk_level if latest else None,
        profile_completion=profile_completion,
        health_summary=ai_summary,
        attention_required=list(set(attention_required)),
        improving_parameters=list(set(improving_parameters)),
        declining_parameters=list(set(declining_parameters)),
        recent_reports=len(completed),
        latest_insights=insights,
        recommendations=recommendations,
        stats=stats,
        health_timeline=health_timeline,
        parameter_trends=parameter_trends,
    )


