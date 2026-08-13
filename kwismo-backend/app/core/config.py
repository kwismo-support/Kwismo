"""Configuration centralisee (lecture de .env). / Centralized configuration (.env)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Base de donnees
    db_type: str = "sqlite"
    database_url: str = "file:./dev.db"

    # JWT
    jwt_secret: str = "changeme"
    jwt_access_expire_min: int = 15
    jwt_refresh_expire_days: int = 7

    # Chiffrement des champs sensibles (Fernet, cle via `Fernet.generate_key()`)
    field_encryption_key: str = "changeme-generate-with-Fernet.generate_key()"

    # Service IA
    ai_service_url: str = "http://localhost:8001"
    ai_service_timeout_seconds: float = 5.0

    # OTP
    otp_expire_min: int = 5

    # Reseau / CORS
    cors_origins: str = "http://localhost:5173"
    allowed_hosts: str = "*"
    redis_url: str = "redis://localhost:6379"

    # Limitation de debit (anti brute-force / anti DoS)
    rate_limit_storage_uri: str = "memory://"
    rate_limit_default: str = "100/minute"
    rate_limit_auth: str = "10/minute"
    rate_limit_otp: str = "5/minute"

    # Garde-fous de charge
    max_request_body_mb: int = 5

    # Stockage fichiers (images/videos)
    upload_dir: str = "./storage/uploads"
    max_upload_size_mb: int = 20
    allowed_image_extensions: str = "jpg,jpeg,png,webp"
    allowed_video_extensions: str = "mp4,mov,webm"

    # Email (Resend)
    resend_api_key: str = ""
    email_from: str = "KWISMO <noreply@unphishable.org>"

    # SMS (Twilio Verify)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_verify_service_sid: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_hosts_list(self) -> list[str]:
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]

    @property
    def allowed_image_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.allowed_image_extensions.split(",") if ext.strip()]

    @property
    def allowed_video_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.allowed_video_extensions.split(",") if ext.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
