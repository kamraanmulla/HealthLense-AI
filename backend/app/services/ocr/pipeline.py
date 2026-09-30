"""
HealthLens AI — OCR Pipeline
==============================
Main entry point for extracting text from medical report files.
Coordinates PDF extraction, image preprocessing, and Tesseract OCR.
"""

from __future__ import annotations

import os

import pytesseract
from PIL import Image

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.ocr.image_processor import preprocess_image
from app.services.ocr.pdf_extractor import extract_text_from_pdf, render_pdf_as_images
from app.services.ocr.text_cleaner import clean_text

logger = get_logger(__name__)


def extract_report_text(file_path: str, file_type: str) -> str:
    """
    Run the full OCR pipeline on a given file.

    Args:
        file_path: Absolute path to the uploaded file.
        file_type: Extension (e.g., 'pdf', 'png', 'jpg').

    Returns:
        Cleaned text extracted from the report.
    """
    settings = get_settings()
    
    # Ensure tesseract command is configured if non-default
    if settings.tesseract_cmd != "tesseract":
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

    raw_text = ""

    if file_type == "pdf":
        # 1. Try direct text extraction
        raw_text = extract_text_from_pdf(file_path)
        
        # 2. If no text found, it's likely an image-based PDF. Render and OCR.
        if not raw_text.strip():
            logger.info("ocr.pipeline.falling_back_to_image_ocr", path=file_path)
            pages = render_pdf_as_images(file_path)
            for page_img in pages:
                processed_img = preprocess_image(page_img)
                raw_text += pytesseract.image_to_string(processed_img) + "\n"
    else:
        # It's an image file (PNG/JPG)
        try:
            with Image.open(file_path) as img:
                processed_img = preprocess_image(img)
                raw_text = pytesseract.image_to_string(processed_img)
        except Exception as exc:
            logger.error("ocr.pipeline.image_ocr_failed", error=str(exc))
            raise

    # 3. Clean and normalize the text
    cleaned_text = clean_text(raw_text)
    
    logger.info(
        "ocr.pipeline.completed",
        path=file_path,
        text_length=len(cleaned_text),
    )
    
    return cleaned_text
