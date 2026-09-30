"""
HealthLens AI — PDF Extractor
===============================
Extracts text from PDF files using pdfplumber and PyMuPDF.
Yields images for Tesseract if the PDF is purely image-based.
"""

from __future__ import annotations

import io
from typing import Generator, List, Union

import fitz  # PyMuPDF
import pdfplumber
from PIL import Image

from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Attempt to extract text directly from a PDF.
    Tries pdfplumber first, falls back to PyMuPDF if text length is too short.

    Args:
        file_path: Absolute path to the PDF file.

    Returns:
        Extracted text string, or empty string if it appears to be an image-only PDF.
    """
    text = ""
    try:
        # 1. Try pdfplumber
        with pdfplumber.open(file_path) as pdf:
            pages_text = [page.extract_text() or "" for page in pdf.pages]
            text = "\n".join(pages_text)
            
        if len(text.strip()) > 50:
            logger.info("ocr.pdf_extractor.pdfplumber_success", path=file_path)
            return text

        # 2. Try PyMuPDF if pdfplumber failed to extract meaningful text
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
                
        if len(text.strip()) > 50:
            logger.info("ocr.pdf_extractor.pymupdf_success", path=file_path)
            return text

    except Exception as exc:
        logger.warning("ocr.pdf_extractor.text_extraction_failed", error=str(exc))

    # If we get here, the PDF is likely image-based or extraction failed.
    return ""


def render_pdf_as_images(file_path: str) -> Generator[Image.Image, None, None]:
    """
    Render PDF pages as PIL Images for OCR processing.

    Args:
        file_path: Absolute path to the PDF file.

    Yields:
        PIL Image objects for each page.
    """
    try:
        with fitz.open(file_path) as doc:
            # 300 DPI is generally recommended for OCR
            zoom = 300 / 72
            mat = fitz.Matrix(zoom, zoom)
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                # Convert PyMuPDF pixmap to PIL Image
                img_data = pix.tobytes("png")
                yield Image.open(io.BytesIO(img_data))
                
    except Exception as exc:
        logger.error("ocr.pdf_extractor.render_failed", error=str(exc))
