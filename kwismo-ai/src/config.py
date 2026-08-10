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

    # Scraping
    scraper_user_agent: str = "KWISMO-DataCollector/1.0"
    scraper_delay_seconds: float = 3.0
    scraper_max_concurrency: int = 2
    scraper_timeout_seconds: float = 15.0

    # Comptes dedies au scraping
    facebook_username: str = ""
    facebook_password: str = ""
    instagram_username: str = ""
    instagram_password: str = ""
    x_username: str = ""
    x_password: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
