"""Configuration centralisee (lecture de .env). / Centralized configuration (.env)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    backend_url: str = "http://localhost:8000"
    model_dir: str = "./models"
    model_a_version: str = "latest"
    model_b_version: str = "latest"
    hf_model_name: str = "Davlan/afro-xlmr-base"
    predict_threshold: float = 0.5

    # Garde-fous de charge : jamais paralyser le service.
    # "memory://" par defaut : aucune dependance externe requise pour demarrer.
    rate_limit_storage_uri: str = "memory://"
    rate_limit_default: str = "300/minute"
    max_request_body_mb: int = 2


@lru_cache
def get_settings() -> Settings:
    return Settings()
