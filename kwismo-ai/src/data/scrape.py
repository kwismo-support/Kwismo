"""Collecte depuis des sources texte (presse, institutionnel). / Collection from text-native sources (press, institutional).

FR — Sources prioritaires : le message d'arnaque y est generalement cite
en clair dans l'article, donc pas d'OCR necessaire. Respecte robots.txt,
limite la cadence par domaine, journalise mais n'insiste pas en cas
d'echec (une source indisponible ne doit jamais bloquer les autres).
EN — Priority sources: the scam message is usually quoted verbatim in the
article, so no OCR needed. Respects robots.txt, paces requests per domain,
logs but doesn't retry aggressively on failure (one unavailable source
should never block the others).

Usage: python -m src.data.scrape
"""

import asyncio
import json
import urllib.robotparser as robotparser
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from src.config import get_settings
from src.data.dedupe import is_new_text, is_new_url, mark_text_seen, mark_url_seen

settings = get_settings()

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"

# Sources texte-natif : le message d'arnaque y est generalement cite en clair,
# pas de captation exhaustive du site, juste les pages pertinentes connues.
SOURCES = [
    "https://www.orange.cm/fr/arnaques.html",
    "https://mtn.cm/help/report-fraud/",
    "https://cirt.cm/mefiez-vous-du-phishing-et-des-arnaques-en-ligne/",
    "https://www.237online.com/cameroun-arnaques-en-ligne-pieges/",
    "https://www.stopblablacam.com/culture-et-societe/0312-2298-attention-des-arnaqueurs-deguisent-de-simples-sms-sous-forme-de-notifications-de-transfert-dargent-par-mobile-money",
]

_robots_cache: dict[str, robotparser.RobotFileParser | None] = {}


def _is_allowed(url: str) -> bool:
    domain = urlparse(url).netloc
    if domain not in _robots_cache:
        rp = robotparser.RobotFileParser()
        rp.set_url(f"https://{domain}/robots.txt")
        try:
            rp.read()
            _robots_cache[domain] = rp
        except OSError:
            _robots_cache[domain] = None  # pas de robots.txt lisible -> pas de restriction connue
    rp = _robots_cache[domain]
    return rp is None or rp.can_fetch(settings.scraper_user_agent, url)


def _extract_paragraphs(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
    return "\n".join(p for p in paragraphs if len(p) > 30)


def _append_records(records: list[dict]) -> None:
    if not records:
        return
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("a", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def _fetch_one(client: httpx.AsyncClient, url: str, semaphore: asyncio.Semaphore) -> dict | None:
    if not is_new_url(url) or not _is_allowed(url):
        return None

    async with semaphore:
        try:
            response = await client.get(url, timeout=settings.scraper_timeout_seconds)
            response.raise_for_status()
        except httpx.HTTPError:
            return None
        finally:
            await asyncio.sleep(settings.scraper_delay_seconds)

    mark_url_seen(url)
    texte = _extract_paragraphs(response.text)
    if not texte or not is_new_text(texte):
        return None
    mark_text_seen(texte)

    return {
        "source": urlparse(url).netloc,
        "url": url,
        "date_collecte": datetime.now(UTC).isoformat(),
        "texte": texte,
        "type": "texte",
    }


async def run(sources: list[str] = SOURCES) -> int:
    semaphore = asyncio.Semaphore(settings.scraper_max_concurrency)
    headers = {"User-Agent": settings.scraper_user_agent}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        results = await asyncio.gather(*(_fetch_one(client, url, semaphore) for url in sources))
    records = [r for r in results if r]
    _append_records(records)
    return len(records)


if __name__ == "__main__":
    count = asyncio.run(run())
    print(f"{count} nouveau(x) message(s) collecte(s) -> {OUTPUT_PATH}")
