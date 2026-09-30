"""
HealthLens AI — Clinical Report PDF Generator
=============================================
Generates professional, publication-quality multi-page clinical PDF reports
using ReportLab SimpleDocTemplate, tables, custom flowables, and two-pass
NumberedCanvas for dynamic page numbering.
"""

from __future__ import annotations

import io
from datetime import datetime
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas that adds running headers and 'Page X of Y' footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "HealthLens AI — Clinical Laboratory Analysis Report")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 40, 8.5 * inch - 54, 11 * inch - 40)

        # Running Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 8.5 * inch - 54, 46)

        self.drawString(54, 32, "HealthLens AI • Clinical Intelligence Platform • Educational & Tracking Purposes Only")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_str)
        self.restoreState()


def generate_clinical_pdf(
    report: Any,
    user: Any,
    user_profile: Optional[Any] = None,
) -> bytes:
    """Generate a comprehensive multi-page clinical report PDF and return the raw bytes."""
    buffer = io.BytesIO()

    # Document Geometry: Letter, 0.75-inch (54pt) margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Palette
    primary_color = colors.HexColor("#0F172A")
    brand_green = colors.HexColor("#16A34A")
    muted_slate = colors.HexColor("#64748B")
    border_slate = colors.HexColor("#E2E8F0")
    card_bg = colors.HexColor("#F8FAFC")
    danger_red = colors.HexColor("#DC2626")
    warning_amber = colors.HexColor("#D97706")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=muted_slate,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569"),
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
    )

    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#78350F"),
    )

    def _field(obj: Any, attr: str, default: Any = None) -> Any:
        if obj is None:
            return default
        if isinstance(obj, dict):
            return obj.get(attr, default)
        return getattr(obj, attr, default)

    story: List[Any] = []

    # ── 1. Brand Header & Document Title ──────────────────────────────────────
    rep_id = str(_field(report, "id", "UNKNOWN"))
    created_at = _field(report, "created_at")
    if hasattr(created_at, "strftime"):
        date_str = created_at.strftime("%B %d, %Y")
    elif isinstance(created_at, str):
        try:
            date_str = datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%B %d, %Y")
        except Exception:
            date_str = created_at[:10]
    else:
        date_str = datetime.utcnow().strftime("%B %d, %Y")

    header_data = [
        [
            Paragraph('<font color="#16A34A"><b>HealthLens AI</b></font>', title_style),
            Paragraph(f"<b>REPORT ID:</b> {rep_id[:8].upper()}<br/><font color='#64748B'>Date: {date_str}</font>", ParagraphStyle("RightMeta", parent=subtitle_style, alignment=2)),
        ],
        [
            Paragraph("Clinical Laboratory Intelligence & Longitudinal Health Assessment", subtitle_style),
            "",
        ],
    ]
    header_table = Table(header_data, colWidths=[330, 174])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_green, spaceBefore=0, spaceAfter=8))

    # ── 2. Patient & Report Metadata Grid ─────────────────────────────────────
    user_name = _field(user, "full_name") or "Valued Patient"
    user_email = _field(user, "email", "N/A")
    age_val = _field(user_profile, "age") if user_profile else None
    age_str = f"{age_val} yrs" if age_val else "Not Specified"
    gender_val = _field(user_profile, "gender") if user_profile else None
    gender_str = gender_val.capitalize() if gender_val else "Not Specified"
    bmi_val = _field(user_profile, "bmi") if user_profile else None
    bmi_str = f"{bmi_val:.1f}" if bmi_val is not None else "N/A"
    orig_fn = str(_field(report, "original_filename", "Report"))[:25]

    meta_content = [
        [
            Paragraph(f"<b>Patient:</b> {user_name}", body_style),
            Paragraph(f"<b>Age / Sex:</b> {age_str} / {gender_str}", body_style),
            Paragraph(f"<b>BMI:</b> {bmi_str}", body_style),
        ],
        [
            Paragraph(f"<b>Account:</b> {user_email}", body_style),
            Paragraph(f"<b>Source File:</b> {orig_fn}", body_style),
            Paragraph(f"<b>Processing:</b> Completed", body_style),
        ],
    ]
    meta_table = Table(meta_content, colWidths=[180, 170, 154])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), card_bg),
        ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_slate),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ── 3. Medical Disclaimer Notice ──────────────────────────────────────────
    disclaimer_box = [
        [
            Paragraph(
                "<b>IMPORTANT MEDICAL DISCLAIMER:</b> HealthLens AI is an artificial intelligence platform built for informational and tracking purposes only. This report does not provide medical diagnoses, treatment decisions, or replace professional physician consultations. Always review test results with a qualified healthcare provider.",
                disclaimer_style,
            )
        ]
    ]
    disc_table = Table(disclaimer_box, colWidths=[504])
    disc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#F59E0B")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(disc_table)
    story.append(Spacer(1, 12))

    # ── 4. Executive Health Summary & Overall Score ────────────────────────────
    score_raw = _field(report, "health_score")
    score_val = f"{score_raw:.1f}" if score_raw is not None else "--"
    grade_val = _field(report, "health_grade") or "N/A"
    risk_val = (_field(report, "risk_level") or "LOW").upper()

    risk_badge_color = brand_green
    if risk_val == "HIGH":
        risk_badge_color = danger_red
    elif risk_val == "MODERATE":
        risk_badge_color = warning_amber

    raw_ai = _field(report, "ai_result")
    ai_result = raw_ai if isinstance(raw_ai, dict) else {}
    summary_text = ai_result.get("summary") or ai_result.get("ai_health_summary") or "Comprehensive automated laboratory evaluation completed. Parameters have been benchmarked against clinical reference standards."

    score_card_data = [
        [
            Paragraph(f"<font size='22' color='#16A34A'><b>{score_val}</b></font><font size='11' color='#64748B'> / 100</font><br/><b>Grade: {grade_val}</b><br/><font color='{risk_badge_color.hexval()}'><b>{risk_val} RISK</b></font>", ParagraphStyle("ScoreBlock", parent=styles["Normal"], alignment=1, leading=16)),
            Paragraph(f"<b>Clinical Evaluation Summary:</b><br/>{summary_text}", body_style),
        ]
    ]
    score_table = Table(score_card_data, colWidths=[140, 364])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#BBF7D0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 14))

    # ── 5. Laboratory Test Results Table ──────────────────────────────────────
    story.append(Paragraph("1. Laboratory Test Results & Biomarker Status", section_heading))
    story.append(Spacer(1, 4))

    raw_params = _field(report, "parameters")
    params = list(raw_params) if raw_params else []

    if params:
        param_table_data = [
            [
                Paragraph("<b>TEST / BIOMARKER</b>", table_header_style),
                Paragraph("<b>MEASURED</b>", table_header_style),
                Paragraph("<b>UNIT</b>", table_header_style),
                Paragraph("<b>REFERENCE RANGE</b>", table_header_style),
                Paragraph("<b>STATUS</b>", table_header_style),
            ]
        ]

        for p in params:
            status = (_field(p, "status") or "normal").lower()
            if status == "high":
                status_html = '<font color="#DC2626"><b>HIGH ▲</b></font>'
            elif status == "low":
                status_html = '<font color="#D97706"><b>LOW ▼</b></font>'
            else:
                status_html = '<font color="#16A34A">NORMAL ✓</font>'

            p_min = _field(p, "reference_min")
            p_max = _field(p, "reference_max")
            p_ref = _field(p, "reference_text") or _field(p, "reference_range")
            if p_min is not None and p_max is not None:
                ref_str = f"{p_min} – {p_max}"
            else:
                ref_str = p_ref or "Standard Range"

            p_val = _field(p, "value")
            val_str = f"{p_val:.2f}".rstrip("0").rstrip(".") if p_val is not None else "--"
            p_unit = _field(p, "unit") or "--"
            p_name = _field(p, "name") or "Biomarker"

            param_table_data.append([
                Paragraph(f"<b>{p_name}</b>", table_cell_style),
                Paragraph(val_str, table_cell_style),
                Paragraph(p_unit, table_cell_style),
                Paragraph(ref_str, table_cell_style),
                Paragraph(status_html, table_cell_style),
            ])

        col_widths = [160, 75, 75, 114, 80]
        results_table = Table(param_table_data, colWidths=col_widths, repeatRows=1)
        results_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_slate),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(results_table)
    else:
        story.append(Paragraph("<i>No structured parameters extracted from this report.</i>", body_style))

    story.append(Spacer(1, 14))

    # ── 6. Longitudinal Progression (Prior vs Current) ────────────────────────
    story.append(KeepTogether([
        Paragraph("2. Longitudinal Trend Analysis", section_heading),
        Spacer(1, 4),
    ]))

    ml_data = ai_result.get("ml_anomaly_detection") or {}
    longitudinal_changes = ml_data.get("longitudinal_changes") or []

    if longitudinal_changes:
        long_data = [
            [
                Paragraph("<b>PARAMETER</b>", table_header_style),
                Paragraph("<b>PREVIOUS</b>", table_header_style),
                Paragraph("<b>CURRENT</b>", table_header_style),
                Paragraph("<b>CHANGE (%)</b>", table_header_style),
                Paragraph("<b>TRAJECTORY</b>", table_header_style),
            ]
        ]
        for c in longitudinal_changes:
            direction = c.get("direction", "stable").lower()
            pct = c.get("percentage_change", 0.0)
            sign = "+" if pct > 0 else ""
            if "inc" in direction:
                traj_html = f'<font color="#0284C7">Increasing ({sign}{pct:.1f}%)</font>'
            elif "dec" in direction:
                traj_html = f'<font color="#D97706">Decreasing ({sign}{pct:.1f}%)</font>'
            else:
                traj_html = '<font color="#16A34A">Stable</font>'

            long_data.append([
                Paragraph(f"<b>{c.get('parameter', 'Biomarker')}</b>", table_cell_style),
                Paragraph(str(c.get("previous_value", "--")), table_cell_style),
                Paragraph(str(c.get("current_value", "--")), table_cell_style),
                Paragraph(f"{sign}{pct:.1f}%", table_cell_style),
                Paragraph(traj_html, table_cell_style),
            ])

        long_table = Table(long_data, colWidths=[150, 80, 80, 94, 100], repeatRows=1)
        long_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_slate),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(long_table)
    else:
        note_box = [
            [
                Paragraph(
                    "<b>Initial Baseline Report:</b> No previous completed reports found in your record. As future lab reports are uploaded, HealthLens AI will automatically chart historical biomarker trajectories, velocity of change, and longitudinal stability curves.",
                    body_style,
                )
            ]
        ]
        n_table = Table(note_box, colWidths=[504])
        n_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), card_bg),
            ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(n_table)

    story.append(Spacer(1, 14))

    # ── 7. Health Pattern Insights (Layer B - ML Anomaly Detection) ───────────
    story.append(KeepTogether([
        Paragraph("3. Population Health Pattern Analysis (Layer B • Machine Learning)", section_heading),
        Spacer(1, 4),
    ]))

    anomaly_flag = ml_data.get("anomaly_detected", False)
    anomaly_lvl = (ml_data.get("anomaly_level") or ("ALERT" if anomaly_flag else "NORMAL")).upper()
    reason_str = ml_data.get("reason") or "Multivariable parameter combinations align with normative population patterns."
    affected_p = ml_data.get("affected_parameters") or []
    affected_str = ", ".join(affected_p) if affected_p else "None detected"

    ml_badge_color = danger_red if anomaly_flag else brand_green

    ml_box = [
        [
            Paragraph(f"<b>Statistical Anomaly Status:</b> <font color='{ml_badge_color.hexval()}'><b>{anomaly_lvl}</b></font><br/><b>Multivariate Cohort Model:</b> Isolation Forest (Trained on NHANES Reference Cohorts)<br/><b>Key Parameters Influencing Distribution:</b> {affected_str}<br/><br/><b>Pattern Analysis Narrative:</b><br/>{reason_str}<br/><br/><font size='7.5' color='#64748B'><i>Note: This pattern analysis uses unsupervised multidimensional geometry to evaluate whether your overall lab profile represents an uncommon combination relative to standard population distributions. It is non-diagnostic and serves as an exploratory screening aid.</i></font>", body_style)
        ]
    ]
    ml_table = Table(ml_box, colWidths=[504])
    ml_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), card_bg),
        ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(ml_table)
    story.append(Spacer(1, 14))

    # ── 8. Clinical Insights & Physician Discussion ───────────────────────────
    story.append(KeepTogether([
        Paragraph("4. Actionable Health Insights & Doctor Discussion Points", section_heading),
        Spacer(1, 4),
    ]))

    insights_list = []
    lifestyle = ai_result.get("lifestyle_advice") or []
    diet = ai_result.get("diet_suggestions") or []
    follow_up = ai_result.get("follow_up_tests") or []
    doctor_rec = ai_result.get("doctor_recommendation") or []

    if isinstance(lifestyle, list) and lifestyle:
        insights_list.append(f"<b>Lifestyle Recommendations:</b> {'; '.join(lifestyle[:3])}")
    if isinstance(diet, list) and diet:
        insights_list.append(f"<b>Nutritional Guidance:</b> {'; '.join(diet[:3])}")
    if isinstance(follow_up, list) and follow_up:
        insights_list.append(f"<b>Recommended Follow-Up Investigations:</b> {'; '.join(follow_up[:3])}")
    if isinstance(doctor_rec, list) and doctor_rec:
        insights_list.append(f"<b>Physician Consultation:</b> {'; '.join(doctor_rec[:2])}")
    elif isinstance(doctor_rec, str) and doctor_rec:
        insights_list.append(f"<b>Physician Consultation:</b> {doctor_rec}")

    if not insights_list:
        insights_list = [
            "Maintain balanced hydration and nutrition aligned with clinical reference goals.",
            "Schedule a standard annual health evaluation to recheck baseline panels.",
            "Discuss any persistent symptoms or medication adjustments with your primary care provider.",
        ]

    guidance_items = "".join([f"• {item}<br/><br/>" for item in insights_list])
    guidance_box = [
        [Paragraph(guidance_items, body_style)]
    ]
    g_table = Table(guidance_box, colWidths=[504])
    g_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 0.5, border_slate),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(g_table)

    # Build the document with two-pass NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    return buffer.getvalue()
