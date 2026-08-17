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
    scraper_delay_seconds: float = 2.0
    scraper_max_concurrency: int = 3
    scraper_timeout_seconds: float = 15.0
    scraper_max_retries: int = 3
    scraper_proxy_url: str = ""  # optionnel : proxy legitime deja detenu par l'entreprise
    scraper_search_region: str = "fr-fr"
    scraper_max_results_per_keyword: int = 30

    # Comptes dedies au scraping, plusieurs par plateforme possibles :
    # "user1:pass1,user2:pass2" — essayes dans l'ordre, jamais de bascule
    # automatique silencieuse (voir src/data/scrape_social.py).
    facebook_accounts: str = ""
    instagram_accounts: str = ""
    x_accounts: str = ""

    def _parse_accounts(self, raw: str) -> list[tuple[str, str]]:
        accounts = []
        for pair in raw.split(","):
            pair = pair.strip()
            if not pair or ":" not in pair:
                continue
            user, _, pwd = pair.partition(":")
            accounts.append((user.strip(), pwd.strip()))
        return accounts

    @property
    def facebook_accounts_list(self) -> list[tuple[str, str]]:
        return self._parse_accounts(self.facebook_accounts)

    @property
    def instagram_accounts_list(self) -> list[tuple[str, str]]:
        return self._parse_accounts(self.instagram_accounts)

    @property
    def x_accounts_list(self) -> list[tuple[str, str]]:
        return self._parse_accounts(self.x_accounts)


@lru_cache
def get_settings() -> Settings:
    return Settings()
