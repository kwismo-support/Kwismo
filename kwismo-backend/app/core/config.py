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

    # Service IA
    ai_service_url: str = "http://localhost:8001"
    ai_service_timeout_seconds: float = 5.0

    # OTP
    otp_expire_min: int = 5

    # Reseau / CORS
    cors_origins: str = "http://localhost:5173"
    allowed_hosts: str = "*"
    redis_url: str = "redis://localhost:6379"

    # Limitation de debit (anti brute-force / anti DoS, cf. cahier §8.1 et §8.5)
    # "memory://" par defaut : aucune dependance externe, ne peut jamais bloquer
    # le demarrage si Redis est indisponible. Passer a redis_url en production
    # multi-workers (Gunicorn) pour partager les compteurs entre processus.
    rate_limit_storage_uri: str = "memory://"
    rate_limit_default: str = "100/minute"
    rate_limit_auth: str = "10/minute"
    rate_limit_otp: str = "5/minute"

    # Garde-fous de charge (cf. cahier §8.5 : jamais paralyser le backend)
    max_request_body_mb: int = 5

    # Stockage fichiers (images/videos) — pas encore de route d'upload dans le
    # cahier §5, mais parametrage pret pour que les futurs devs n'aient qu'a
    # coder la route, pas a redefinir ces regles.
    upload_dir: str = "./storage/uploads"
    max_upload_size_mb: int = 20
    allowed_image_extensions: str = "jpg,jpeg,png,webp"
    allowed_video_extensions: str = "mp4,mov,webm"

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
