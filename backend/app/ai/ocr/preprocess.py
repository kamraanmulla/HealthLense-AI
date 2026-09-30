"""
OCR preprocessing and text cleaning functions.
"""
import re
from app.core.logging import get_logger

logger = get_logger(__name__)

def clean_extracted_text(text: str) -> str:
    """Clean and normalize extracted OCR text."""
    if not text:
        return ""
        
    # Remove non-ascii characters (keep basic punctuation and newlines)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    
    # Replace multiple spaces with a single space
    text = re.sub(r"[ \t]+", " ", text)
    
    # Normalize newlines
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # Trim leading/trailing whitespace per line
    lines = [line.strip() for line in text.split("\n")]
    
    # Rejoin lines
    text = "\n".join(lines)
    
    return text.strip()
