"""
HealthLens AI — Reports Router (Foundation)
=============================================
Handles file upload, status polling, list retrieval, and deletion.
Heavy OCR/AI processing (Phase 3) is invoked from here via ReportService.

Endpoints
---------
POST   /reports/           Upload a new report file
GET    /reports/           List all reports (paginated, filterable)
GET    /reports/{id}       Get full report detail
GET    /reports/{id}/status  Poll processing status
DELETE /reports/{id}       Soft-delete a report
"""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, UploadFile, status
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.report import Report
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationMeta
from app.schemas.report import (
    ReportDetailResponse,
    ReportListItem,
    ReportStatusResponse,
    ReportUploadResponse,
    ChatRequest,
    ChatResponse
)
from app.services.ai.ai_service import get_ai_provider

logger = get_logger(__name__)
router = APIRouter()

# ── Constants ─────────────────────────────────────────────────────────────────
_ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
}


def _validate_upload(file: UploadFile) -> None:
    """
    Validate uploaded file by content type and size.

    Args:
        file: The uploaded file object from FastAPI.

    Raises:
        HTTPException 415: Unsupported media type.
        HTTPException 413: File too large.
    """
    settings = get_settings()

    # Content-type check (client-supplied; deep check happens in OCR pipeline)
    content_type = (file.content_type or "").lower()
    if content_type not in _ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed: PDF, PNG, JPG/JPEG.",
        )


def _derive_file_type(filename: str) -> str:
    """Return the lowercase extension without the leading dot."""
    return Path(filename).suffix.lstrip(".").lower()


@router.post(
    "/",
    response_model=ReportUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a medical report",
    description=(
        "Accepts a PDF or image file, stores it securely, "
        "and queues it for OCR + AI analysis. Poll ``/reports/{id}/status`` "
        "for updates."
    ),
)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF, PNG, JPG, or JPEG blood report."),
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> ReportUploadResponse:
    """Accept a report file and enqueue background processing."""
    settings = get_settings()
    _validate_upload(file)

    # ── Persist file with a UUID name ──────────────────────────────────────
    report_id = str(uuid.uuid4())
    original_filename = file.filename or "report"
    file_ext = _derive_file_type(original_filename)
    if file_ext not in settings.allowed_extensions_set:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Extension '.{file_ext}' is not permitted.",
        )

    stored_filename = f"{report_id}.{file_ext}"
    upload_path = Path(settings.upload_dir) / stored_filename

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.max_upload_size_mb} MB.",
        )

    upload_path.write_bytes(file_bytes)
    logger.info("reports.file_saved", report_id=report_id, path=str(upload_path))

    # ── Create pending DB record ───────────────────────────────────────────
    report = Report(
        id=report_id,
        user_id=current_user.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=str(upload_path),
        file_type=file_ext,
        file_size_bytes=len(file_bytes),
        status="pending",
    )
    db.add(report)
    db.commit()

    # ── Queue OCR + AI processing ───────────
    from app.ai.service import process_report
    background_tasks.add_task(process_report, report_id)

    return ReportUploadResponse(id=report_id)


@router.get(
    "/",
    response_model=PaginatedResponse[ReportListItem],
    summary="List all reports",
    description="Returns a paginated list of the current user's reports, newest first.",
)
def list_reports(
    page: int = Query(1, ge=1, description="Page number."),
    per_page: int = Query(10, ge=1, le=50, description="Items per page."),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by processing status."),
    search: Optional[str] = Query(None, description="Search by original filename."),
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ReportListItem]:
    """Return paginated, non-deleted reports for the current user."""
    query = (
        db.query(Report)
        .filter(Report.user_id == current_user.id, Report.is_deleted == False)  # noqa: E712
    )
    if status_filter:
        query = query.filter(Report.status == status_filter)
    if search:
        query = query.filter(Report.original_filename.ilike(f"%{search}%"))

    total = query.count()
    reports = (
        query.order_by(Report.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    pages = max(1, -(-total // per_page))  # ceiling division
    return PaginatedResponse(
        data=[ReportListItem.model_validate(r) for r in reports],
        meta=PaginationMeta(total=total, page=page, per_page=per_page, pages=pages),
    )


@router.get(
    "/{report_id}",
    response_model=ReportDetailResponse,
    summary="Get report detail",
    description="Returns the full report including parameters and AI analysis.",
)
def get_report(
    report_id: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> Report:
    """Fetch one report and verify ownership."""
    report = _get_owned_report(report_id, current_user.id, db)
    return report


@router.get(
    "/{report_id}/status",
    response_model=ReportStatusResponse,
    summary="Poll report processing status",
    description="Lightweight endpoint for the frontend to check if processing has finished.",
)
def get_report_status(
    report_id: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> ReportStatusResponse:
    """Return just the processing status of a report with real-time progress."""
    report = _get_owned_report(report_id, current_user.id, db)
    from app.services.report_service import get_report_progress
    prog_info = get_report_progress(report_id)

    if report.status == "completed":
        progress = 100
        processing_stage = "Completed"
    elif report.status == "failed":
        progress = prog_info.get("progress", 50)
        processing_stage = "Failed"
    else:
        progress = prog_info.get("progress", 20)
        processing_stage = prog_info.get("stage", "Processing report...")

    return ReportStatusResponse(
        id=report.id,
        status=report.status,
        health_score=report.health_score,
        health_grade=report.health_grade,
        risk_level=report.risk_level,
        confidence_pct=report.confidence_pct,
        error_message=report.error_message,
        progress=progress,
        processing_stage=processing_stage,
    )


@router.delete(
    "/{report_id}",
    response_model=MessageResponse,
    summary="Delete a report",
    description="Soft-deletes a report. The record is retained in the database.",
)
def delete_report(
    report_id: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Soft-delete a report."""
    report = _get_owned_report(report_id, current_user.id, db)
    report.is_deleted = True
    db.commit()
    logger.info("reports.deleted", report_id=report_id, user_id=current_user.id)
    return MessageResponse(message="Report deleted successfully.")


def _get_report_or_404(db: Session, report_id: str, user_id: int) -> Report:
    """Alias for _get_owned_report used by the chat endpoint."""
    return _get_owned_report(report_id, user_id, db)


@router.get(
    "/{report_id}/export/pdf",
    summary="Export report to PDF",
    description="Generates a publication-quality clinical PDF document of the report analysis.",
)
def export_report_pdf(
    report_id: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
):
    """Generate and return a professional clinical PDF of the report."""
    import io
    from fastapi.responses import StreamingResponse
    from app.models.user import UserProfile
    from app.services.reporting.pdf_generator import generate_clinical_pdf

    report = _get_owned_report(report_id, current_user.id, db)
    
    if report.status != "completed":
        raise HTTPException(status_code=400, detail="Report processing is not completed yet.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    pdf_bytes = generate_clinical_pdf(
        report=report,
        user=current_user,
        user_profile=profile,
    )
    
    clean_id = report_id[:8]
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="healthlens_clinical_report_{clean_id}.pdf"'},
    )



# ── Private helpers ───────────────────────────────────────────────────────────

def _get_owned_report(report_id: str, user_id: int, db: Session) -> Report:
    """
    Fetch a non-deleted report and verify it belongs to ``user_id``.

    Raises:
        HTTPException 404: If the report does not exist or belongs to another user.
    """
    report: Report | None = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == user_id,
            Report.is_deleted == False,  # noqa: E712
        )
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )
    return report

@router.post(
    "/{report_id}/chat",
    response_model=ChatResponse,
    summary="Chat with the medical report assistant",
    description="Ask a question about a specific report. Answers strictly from the report context."
)
async def chat_with_report_endpoint(
    report_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db)
):
    """
    Handles conversational questions using the report as context.
    """
    report = _get_report_or_404(db, report_id, current_user.id)
    
    if report.status != "completed" or not report.ai_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report processing is not complete yet."
        )
        
    context = {
        "health_score": report.health_score,
        "abnormal_parameters": report.ai_result.get("abnormal_parameters", []),
        "detected_conditions": report.ai_result.get("detected_conditions", []),
        "ai_health_summary": report.ai_result.get("ai_health_summary", {})
    }
    
    ai_provider = get_ai_provider()
    try:
        result = await ai_provider.chat_with_report(
            report_context=context,
            question=request.question
        )
        return ChatResponse(
            answer=result.get("answer", "I couldn't process your question."),
            disclaimer=result.get("disclaimer", "Consult a doctor for medical advice.")
        )
    except Exception as e:
        logger.error("api.chat_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate a chat response."
        )
