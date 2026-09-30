"""
HealthLens AI — Image Processor
=================================
Preprocesses images for optimal OCR using OpenCV.
Features:
- Grayscale conversion
- Denoising
- Adaptive thresholding
- Deskewing
- Sharpening
"""

from __future__ import annotations

import cv2
import numpy as np
from PIL import Image

from app.core.logging import get_logger

logger = get_logger(__name__)


def preprocess_image(pil_image: Image.Image) -> Image.Image:
    """
    Apply OpenCV preprocessing to an image to improve OCR accuracy.

    Args:
        pil_image: The original image.

    Returns:
        The preprocessed image ready for Tesseract.
    """
    try:
        # Convert PIL to OpenCV format (numpy array)
        img_np = np.array(pil_image)
        
        # Ensure we have a BGR image before converting to grayscale
        if len(img_np.shape) == 2:
            # Already grayscale
            gray = img_np
        elif img_np.shape[2] == 4:
            # Convert RGBA to BGR
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
        else:
            # Convert RGB to BGR
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

        # 1. Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=30)

        # 2. Deskew
        deskewed = _deskew(denoised)

        # 3. Sharpen
        sharpened = _sharpen(deskewed)

        # 4. Adaptive Thresholding (Binarization)
        # Using Gaussian thresholding for better handling of varying illumination
        thresh = cv2.adaptiveThreshold(
            sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Convert back to PIL
        return Image.fromarray(thresh)
    except Exception as exc:
        logger.warning("ocr.image_preprocessing_failed", error=str(exc))
        # Fallback to original image if preprocessing fails
        return pil_image


def _deskew(image: np.ndarray) -> np.ndarray:
    """Detect and correct skew in the image."""
    coords = np.column_stack(np.where(image > 0))
    if len(coords) == 0:
        return image
        
    angle = cv2.minAreaRect(coords)[-1]
    
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    m = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated


def _sharpen(image: np.ndarray) -> np.ndarray:
    """Sharpen the image using a laplacian kernel."""
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(image, -1, kernel)
