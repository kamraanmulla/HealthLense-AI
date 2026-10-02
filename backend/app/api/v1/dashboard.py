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
from datetime import datetime, timedelta
from typing import List, Optional

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
    KeyBiomarker,
    HealthCategoryBreakdown,
    RecentActivityItem,
    DashboardRecentReport,
    NextCheckupInfo,
)

router = APIRouter()


def _format_time_ago(dt: Optional[datetime]) -> str:
    if not dt:
        return "Recently"
    now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    if days < 7:
        return f"{days} days ago"
    if days < 30:
        weeks = days // 7
        return f"{weeks}w ago"
    months = days // 30
    return f"{months}mo ago"


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

    # ── Profile & Intelligent Enhancements ───────────────────────────────────
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

    # ── Key Biomarkers (Reference UI) ─────────────────────────────────────────
    # Look for key indicator groups: Glucose, Cholesterol, Vitamin D, Hemoglobin
    key_biomarkers: List[KeyBiomarker] = []
    all_latest_params = list(latest.parameters) if latest else []

    def find_param_by_keywords(keywords: List[str]) -> Optional[ReportParameter]:
        for p in all_latest_params:
            if any(k in p.name.lower() for k in keywords) and p.value is not None:
                return p
        return None

    glucose_param = find_param_by_keywords(["glucose", "sugar", "fbs"])
    cholesterol_param = find_param_by_keywords(["cholesterol", "ldl"])
    vit_d_param = find_param_by_keywords(["vitamin d", "vit d", "25-oh"])
    hemo_param = find_param_by_keywords(["hemoglobin", "haemoglobin", "hb"])

    picked_params = [p for p in [glucose_param, cholesterol_param, vit_d_param, hemo_param] if p is not None]
    # Add other params if fewer than 4 available
    for p in all_latest_params:
        if len(picked_params) >= 4:
            break
        if p not in picked_params and p.value is not None:
            picked_params.append(p)

    for p in picked_params:
        disp_name = p.name
        if "glucose" in p.name.lower():
            disp_name = "Glucose"
        elif "ldl" in p.name.lower():
            disp_name = "Cholesterol (LDL)"
        elif "cholesterol" in p.name.lower():
            disp_name = "Cholesterol (Total)"
        elif "vitamin d" in p.name.lower():
            disp_name = "Vitamin D"
        elif "hemoglobin" in p.name.lower() or "haemoglobin" in p.name.lower():
            disp_name = "Hemoglobin"

        ref_str = p.reference_text or ""
        if not ref_str:
            if p.reference_min is not None and p.reference_max is not None:
                ref_str = f"{p.reference_min} - {p.reference_max}"
            elif p.reference_max is not None:
                ref_str = f"< {p.reference_max}"
            elif p.reference_min is not None:
                ref_str = f"> {p.reference_min}"

        key_biomarkers.append(
            KeyBiomarker(
                name=p.name,
                display_name=disp_name,
                value=p.value,
                unit=p.unit or "",
                reference_range=ref_str,
                status=p.status or "normal",
                min_ref=p.reference_min,
                max_ref=p.reference_max,
                category="key",
            )
        )

    # ── Health Score Breakdown ────────────────────────────────────────────────
    health_score_breakdown: Optional[HealthCategoryBreakdown] = None

    if latest and all_latest_params:
        metabolic_score = 85
        cardio_score = 78
        nutri_score = 82
        lifestyle_score = 80

        metabolic_p = [p for p in all_latest_params if any(k in p.name.lower() for k in ["glucose", "sugar", "hba1c", "creatinine", "uric acid"])]
        metabolic_abnormal = sum(1 for p in metabolic_p if p.status != "normal")
        metabolic_score = max(50, min(95, 88 - (metabolic_abnormal * 10)))

        cardio_p = [p for p in all_latest_params if any(k in p.name.lower() for k in ["cholesterol", "triglyceride", "ldl", "hdl", "lipid"])]
        cardio_abnormal = sum(1 for p in cardio_p if p.status != "normal")
        cardio_score = max(50, min(95, 85 - (cardio_abnormal * 10)))

        nutri_p = [p for p in all_latest_params if any(k in p.name.lower() for k in ["vitamin", "calcium", "iron", "ferritin", "hemoglobin"])]
        nutri_abnormal = sum(1 for p in nutri_p if p.status != "normal")
        nutri_score = max(50, min(95, 86 - (nutri_abnormal * 10)))

        if profile:
            lifestyle_score = 78
            if profile.activity_level in ["Moderately Active", "Very Active"]:
                lifestyle_score += 8
            elif profile.activity_level == "Sedentary":
                lifestyle_score -= 6
            if profile.smoking_status in ["Non-smoker", "Never"]:
                lifestyle_score += 4
            lifestyle_score = max(55, min(95, lifestyle_score))

        health_score_breakdown = HealthCategoryBreakdown(
            metabolic=metabolic_score,
            cardiovascular=cardio_score,
            nutritional=nutri_score,
            lifestyle=lifestyle_score,
        )

    # ── Recent Activity ───────────────────────────────────────────────────────
    recent_activity: List[RecentActivityItem] = []
    if latest:
        recent_activity.append(
            RecentActivityItem(
                id=f"act-proc-{latest.id[:8]}",
                title="Report Processed",
                description=latest.original_filename,
                time_ago=_format_time_ago(latest.created_at),
                type="report",
                timestamp=latest.created_at,
            )
        )
        recent_activity.append(
            RecentActivityItem(
                id=f"act-ana-{latest.id[:8]}",
                title="Analysis Complete",
                description=latest.original_filename.replace(".pdf", ""),
                time_ago=_format_time_ago(latest.updated_at or latest.created_at),
                type="analysis",
                timestamp=latest.updated_at or latest.created_at,
            )
        )

    if profile and profile.updated_at:
        recent_activity.append(
            RecentActivityItem(
                id="act-prof",
                title="Profile Updated",
                description="Your profile information",
                time_ago=_format_time_ago(profile.updated_at),
                type="profile",
                timestamp=profile.updated_at,
            )
        )

    if latest and latest.ai_result:
        recent_activity.append(
            RecentActivityItem(
                id=f"act-ins-{latest.id[:8]}",
                title="AI Insight Generated",
                description="Health trends & recommendations",
                time_ago=_format_time_ago(latest.created_at),
                type="insight",
                timestamp=latest.created_at,
            )
        )

    # ── Recent Reports List (5 most recent) ──────────────────────────────────
    recent_reports_list: List[DashboardRecentReport] = []
    for r in reversed(all_reports[-5:]):
        recent_reports_list.append(
            DashboardRecentReport(
                id=r.id,
                name=r.original_filename.replace(".pdf", "").replace(".png", "").replace(".jpg", ""),
                date=r.created_at.strftime("%b %d, %Y") if r.created_at else "Recent",
                status="Analyzed" if r.status == "completed" else r.status.capitalize(),
                health_score=r.health_score,
                risk_level=r.risk_level,
            )
        )

    # ── Next Checkup Estimation ───────────────────────────────────────────────
    next_checkup: Optional[NextCheckupInfo] = None
    if latest and latest.created_at:
        interval_days = 90 if (latest.risk_level in ["HIGH", "CRITICAL"] or (latest.health_score and latest.health_score < 70)) else 180
        target_date = latest.created_at + timedelta(days=interval_days)
        today = datetime.now()
        days_left = max(1, (target_date.date() - today.date()).days)
        next_checkup = NextCheckupInfo(
            date_str=target_date.strftime("%b %d, %Y"),
            days_left=days_left,
            recommendation="Routine checkup recommended based on report history.",
        )

    total_biomarkers = len(set(p.name for p in all_params if p.name))

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
        key_biomarkers=key_biomarkers,
        health_score_breakdown=health_score_breakdown,
        recent_activity=recent_activity,
        recent_reports_list=recent_reports_list,
        total_biomarkers=total_biomarkers,
        next_checkup=next_checkup,
    )
