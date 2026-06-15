import os
import sys
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MindGuard IA"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: Optional[str] = Field(None, validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SQLALCHEMY_DATABASE_URL: str = Field("sqlite+aiosqlite:///./mindguard.db", validation_alias="DATABASE_URL")
    GOOGLE_API_KEY: Optional[str] = Field(None, validation_alias="GOOGLE_API_KEY")
    GROQ_API_KEY: Optional[str] = Field(None, validation_alias="GROQ_API_KEY")

    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_USER: Optional[str] = Field(None, validation_alias="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, validation_alias="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field(None, validation_alias="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = "MindGuard IA"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()

# Enforce security: do not allow a hardcoded secret key fallback in production environments
if not settings.SECRET_KEY:
    is_development_or_test = (
        "pytest" in sys.modules or 
        os.getenv("ENV") == "development" or 
        os.path.exists(".pytest_cache")
    )
    if is_development_or_test:
        settings.SECRET_KEY = "fallback-secure-development-key-mindguard-2026"
    else:
        raise ValueError("VULNERABILIDAD EVITADA: La variable de entorno SECRET_KEY debe estar configurada en producción.")
