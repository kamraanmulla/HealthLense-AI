"""
HealthLens AI — Application Configuration
==========================================
Centralised settings management using Pydantic Settings.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "HealthLens AI"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Database
    database_url: str = "sqlite:///./healthlens.db"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    # Upload
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10
    allowed_extensions: str = "pdf,png,jpg,jpeg"

    @property
    def allowed_extensions_set(self) -> set[str]:
        return {
            ext.strip().lower()
            for ext in self.allowed_extensions.split(",")
        }

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    # AI
    ai_provider: str = "gemini"
    ai_model: str = "gemini-2.5-flash"
    gemini_api_key: Optional[str] = None
    ai_timeout_seconds: int = 120

    # OCR
    tesseract_cmd: str = "tesseract"

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str):
        if len(value) < 32:
            raise ValueError(
                "SECRET_KEY must contain at least 32 characters."
            )
        return value


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    print("=" * 60)
    print("AI Provider :", settings.ai_provider)
    print("AI Model    :", settings.ai_model)
    print("Database    :", settings.database_url)
    print("Upload Dir  :", settings.upload_dir)
    print("=" * 60)

    return settings