"""
Application configuration module.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "XiaoChaGuan API"
    app_env: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # LLM APIs
    claude_api_key: str = ""
    openai_api_key: str = ""

    # Vector Database
    pinecone_api_key: str = ""
    pinecone_environment: str = "us-east-1"
    pinecone_index: str = "xiaochaguan"

    # Cache
    redis_url: str = "redis://localhost:6379"

    # Embedding
    embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2"

    # Rate Limiting
    rate_limit_per_minute: int = 60

    # CORS
    cors_origins: str = "http://localhost:3000,chrome-extension://*"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
