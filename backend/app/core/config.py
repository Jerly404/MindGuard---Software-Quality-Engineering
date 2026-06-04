from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MindGuard IA"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-super-secret-key-for-dev-only"  # Change in production
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
