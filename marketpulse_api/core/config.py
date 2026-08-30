import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "MarketPulse AI"
    PROJECT_DESCRIPTION: str = "Institutional Multi-Agent Quantitative Trading Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "marketpulse-super-secret-jwt-key-production-2026-institutional")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database (Auto-normalizes postgres:// -> postgresql+asyncpg://)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{BASE_DIR}/marketpulse.db"
    )

    # API Keys & LLM Inference
    GROQ_API_KEY: str = os.getenv(
        "GROQ_API_KEY",
        "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"
    )
    ALPACA_API_KEY: str = os.getenv("ALPACA_API_KEY", "")
    ALPACA_SECRET_KEY: str = os.getenv("ALPACA_SECRET_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Cloud & AWS Storage
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")

    # Redis & Distributed Caching
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://marketpulse.ai",
        "https://app.marketpulse.ai",
        "*"
    ]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 240

    @property
    def async_database_url(self) -> str:
        """Ensures PostgreSQL URLs use the asyncpg async driver."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
