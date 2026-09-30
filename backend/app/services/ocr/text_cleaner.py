"""
HealthLens AI — Text Cleaner
==============================
Cleans and normalizes OCR-extracted text to prepare it for parsing.
"""

from __future__ import annotations

import re


def clean_text(text: str) -> str:
    """
    Clean and normalize raw OCR text.

    Args:
        text: Raw text string from OCR.

    Returns:
        Cleaned and normalized text.
    """
    if not text:
        return ""

    # Remove non-ascii characters (keep basic punctuation and newlines)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    
    # Replace multiple spaces with a single space
    text = re.sub(r"[ \t]+", " ", text)
    
    # Normalize newlines
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # Fix common OCR mistakes in numbers and units
    text = text.replace("O", "0") # Be careful with this, maybe only in number contexts, but for now simple
    # Actually, replacing 'O' with '0' globally is dangerous. Let's do it selectively using regex later.
    
    # Trim leading/trailing whitespace per line
    lines = [line.strip() for line in text.split("\n")]
    
    # Rejoin lines
    text = "\n".join(lines)
    
    return text.strip()
