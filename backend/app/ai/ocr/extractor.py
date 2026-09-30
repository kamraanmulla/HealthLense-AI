"""
OCR Extraction Module.
"""
import os
from typing import Optional

from app.core.logging import get_logger
from app.ai.ocr.preprocess import clean_extracted_text

logger = get_logger(__name__)

# Absolute path to Tesseract OCR executable
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(file_path: str, file_type: str) -> str:
    """
    Extract text from a file (PDF or Image).
    Handles corrupted files, empty documents, and OCR failures.
    """
    logger.info("healthlens.ocr.started", file_path=file_path)

    raw_text = ""

    try:
        # PDF Processing
        if file_type.lower() == "pdf":
            try:
                import pdfplumber
                import fitz
            except ImportError:
                logger.error("healthlens.ocr.missing_pdf_libraries")
                raise RuntimeError(
                    "PDF extraction libraries (pdfplumber, PyMuPDF) not installed."
                )

            # First try extracting selectable text
            try:
                with pdfplumber.open(file_path) as pdf:
                    pages = [page.extract_text() or "" for page in pdf.pages]
                    raw_text = "\n".join(pages)
            except Exception as e:
                logger.warning(
                    "healthlens.ocr.pdfplumber_failed",
                    error=str(e)
                )

            # Fallback to PyMuPDF
            if not raw_text.strip():
                try:
                    with fitz.open(file_path) as doc:
                        raw_text = "\n".join(
                            page.get_text() for page in doc
                        )
                except Exception as e:
                    logger.warning(
                        "healthlens.ocr.pymupdf_failed",
                        error=str(e)
                    )

            # OCR fallback for scanned PDFs
            if not raw_text.strip():
                try:
                    import pytesseract
                    from PIL import Image
                    from io import BytesIO

                    # Tell pytesseract where Tesseract is installed
                    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

                    with fitz.open(file_path) as doc:
                        for page_num in range(len(doc)):
                            page = doc.load_page(page_num)
                            pix = page.get_pixmap(alpha=False)

                            img = Image.open(BytesIO(pix.tobytes("png")))

                            raw_text += (
                                pytesseract.image_to_string(img)
                                + "\n"
                            )

                except ImportError:
                    logger.warning("healthlens.ocr.missing_tesseract")
                except Exception as e:
                    logger.warning(
                        "healthlens.ocr.image_pdf_failed",
                        error=str(e)
                    )

        # Image Processing
        else:
            try:
                import pytesseract
                from PIL import Image

                # Tell pytesseract where Tesseract is installed
                pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

                with Image.open(file_path) as img:
                    raw_text = pytesseract.image_to_string(img)

            except ImportError:
                logger.error("healthlens.ocr.missing_image_libraries")
                raise RuntimeError(
                    "Image extraction libraries (pytesseract, Pillow) not installed."
                )

            except Exception as e:
                logger.error(
                    "healthlens.ocr.image_failed",
                    error=str(e)
                )
                raise

    except Exception as e:
        logger.error(
            "healthlens.ocr.failed",
            error=str(e)
        )
        raise

    if not raw_text.strip():
        logger.warning(
            "healthlens.ocr.empty_result",
            file_path=file_path
        )
        return ""

    cleaned_text = clean_extracted_text(raw_text)

    logger.info(
        "healthlens.ocr.completed",
        text_length=len(cleaned_text)
    )

    return cleaned_text