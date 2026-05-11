from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MindGuard IA"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-super-secret-key-for-dev-only" # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SQLALCHEMY_DATABASE_URL: str = "sqlite+aiosqlite:///./mindguard.db"
    GOOGLE_API_KEY: Optional[str] = Field(None, env="GOOGLE_API_KEY")

    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_USER: Optional[str] = Field(None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, env="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field(None, env="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = "MindGuard IA"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
