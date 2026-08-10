"""Collecte de messages d'arnaque/usurpation via decouverte web dynamique. / Scam/identity-theft message collection via dynamic web discovery.

FR — Pas de liste de sites figee : interroge un moteur de recherche avec
des mots-cles larges (arnaque, usurpation d'identite, piratage, vidage de
compte...), decouvre des URLs, retient les nouveaux domaines pour les
prochaines recherches (data/interim/known_domains.json). Chaque page
visitee est verifiee pour DU TEXTE ET DES IMAGES — jamais une hypothese
sur le type de contenu d'un site. Un filtre de pertinence ecarte les pages
hors-sujet avant de les garder. Reessaie avec delai croissant sur erreur
reseau ; une coupure ne fait jamais tout recommencer (etat persistant via
dedupe.py).
EN — No fixed site list: queries a search engine with broad keywords
(scam, identity theft, hacking, account draining...), discovers URLs,
remembers new domains for future searches (data/interim/known_domains.json).
Every visited page is checked for BOTH text AND images — never an
assumption about a site's content type. A relevance filter discards
off-topic pages before keeping them. Retries with growing delay on
network errors; a dropped connection never forces a full restart
(persistent state via dedupe.py).

Usage: python -m src.data.scrape
"""

import asyncio
import hashlib
import json
import time
import urllib.robotparser as robotparser
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from ddgs import DDGS

from src.config import get_settings
from src.data.dedupe import claim_image, claim_text, claim_url, is_new_url, reconcile
from src.data.metrics import RunMetrics

settings = get_settings()

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"
IMAGES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "images"
KNOWN_DOMAINS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interim" / "known_domains.json"

# Mots-cles larges : le domaine couvre l'arnaque, l'usurpation d'identite,
# le piratage, le vol et le vidage de compte — pas seulement le SMS mobile money.
SEARCH_KEYWORDS = [
    "arnaque mobile money cameroun",
    "arnaque orange money cameroun",
    "arnaque momo cameroun",
    "usurpation identite cameroun escroquerie",
    "piratage compte mobile money cameroun",
    "vidage compte bancaire arnaque cameroun",
    "vol argent mobile money temoignage cameroun",
    "phishing whatsapp cameroun",
    "scam cameroon mobile money",
    "identity theft cameroon fraud",
]

# Presence d'au moins un de ces mots dans le texte d'une page = jugee pertinente.
RELEVANCE_KEYWORDS = [
    "arnaque", "scam", "escroquerie", "fraude", "pirat", "usurp", "vol ",
    "vide", "otp", "code secret", "momo", "mobile money", "orange money",
    "phishing", "hameconnage", "hameçonnage",
]

MAX_IMAGES_PER_PAGE = 10


def is_relevant(texte: str) -> bool:
    lowered = texte.lower()
    return any(kw in lowered for kw in RELEVANCE_KEYWORDS)


def _load_known_domains() -> set[str]:
    if KNOWN_DOMAINS_PATH.exists():
        return set(json.loads(KNOWN_DOMAINS_PATH.read_text(encoding="utf-8")))
    return set()


def _save_known_domains(domains: set[str]) -> None:
    KNOWN_DOMAINS_PATH.parent.mkdir(parents=True, exist_ok=True)
    KNOWN_DOMAINS_PATH.write_text(json.dumps(sorted(domains), ensure_ascii=False, indent=2), encoding="utf-8")


def discover_urls(keywords: list[str] = SEARCH_KEYWORDS) -> list[str]:
    """FR — Interroge le moteur de recherche, enrichit la liste des domaines
    connus au fil des recherches (jamais de liste de sites figee).
    EN — Queries the search engine, enriches the list of known domains as
    it searches (never a fixed site list)."""

    domains = _load_known_domains()
    urls: list[str] = []
    with DDGS() as ddgs:
        for keyword in keywords:
            try:
                results = ddgs.text(
                    keyword,
                    region=settings.scraper_search_region,
                    max_results=settings.scraper_max_results_per_keyword,
                )
            except Exception:
                continue  # moteur de recherche temporairement indisponible -> mot-cle suivant
            for result in results:
                url = result.get("href")
                if url:
                    urls.append(url)
                    domains.add(urlparse(url).netloc)
            time.sleep(settings.scraper_delay_seconds)
    _save_known_domains(domains)
    return list(dict.fromkeys(urls))  # dedoublonne en gardant l'ordre de decouverte


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


def _extract_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
    return "\n".join(p for p in paragraphs if len(p) > 30)


def _extract_image_urls(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    urls = []
    for img in soup.find_all("img"):
        src = img.get("src")
        if not src or src.startswith("data:"):
            continue
        urls.append(urljoin(base_url, src))
    return urls[:MAX_IMAGES_PER_PAGE]


def _image_filename(source: str, image_url: str) -> str:
    digest = hashlib.md5(image_url.encode("utf-8")).hexdigest()[:16]
    suffix = Path(urlparse(image_url).path).suffix
    suffix = suffix if suffix and len(suffix) <= 5 else ".jpg"
    return f"{source}_{digest}{suffix}"


def _append_record(record: dict) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def _get_with_retry(client: httpx.AsyncClient, url: str) -> httpx.Response | None:
    """FR — Reessaie avec delai croissant (2x a chaque tentative) avant
    d'abandonner cette URL pour ce run ; elle sera retentee au prochain
    lancement puisqu'elle n'est jamais marquee "vue" en cas d'echec.
    EN — Retries with a growing delay (2x each attempt) before giving up
    on this URL for this run; it will be retried on the next launch since
    it's never marked "seen" on failure."""

    delay = settings.scraper_delay_seconds
    for attempt in range(1, settings.scraper_max_retries + 1):
        try:
            response = await client.get(url, timeout=settings.scraper_timeout_seconds)
            response.raise_for_status()
            return response
        except (httpx.TransportError, httpx.HTTPStatusError):
            if attempt == settings.scraper_max_retries:
                return None
            await asyncio.sleep(delay)
            delay *= 2
    return None


async def _process_url(
    client: httpx.AsyncClient, url: str, semaphore: asyncio.Semaphore, metrics: RunMetrics
) -> None:
    source = urlparse(url).netloc
    if not is_new_url(url) or not _is_allowed(url):
        return

    async with semaphore:
        response = await _get_with_retry(client, url)
        await asyncio.sleep(settings.scraper_delay_seconds)

    if response is None:
        metrics.record_error(source)
        return

    claim_url(url)

    texte = _extract_text(response.text)
    if texte and not is_relevant(texte):
        return  # page hors-sujet : ni son texte ni ses images ne sont retenus

    if texte and claim_text(texte):
        _append_record(
            {
                "source": source,
                "url": url,
                "date_collecte": datetime.now(UTC).isoformat(),
                "texte": texte,
                "type": "texte",
            }
        )
        metrics.record_success(source, "texte")

    # Pas de texte pertinent extrait (page en grande partie visuelle) : on ne
    # peut pas juger sa pertinence sans OCR, donc on tente quand meme ses images.
    for image_url in _extract_image_urls(response.text, url):
        image_path = IMAGES_DIR / _image_filename(source, image_url)
        try:
            img_response = await _get_with_retry(client, image_url)
        except Exception:
            img_response = None
        if img_response is None:
            metrics.record_error(source)
            continue

        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        image_path.write_bytes(img_response.content)

        if not claim_image(image_path):
            image_path.unlink(missing_ok=True)  # doublon (ex. logo repete) : pas garde deux fois
            continue

        _append_record(
            {
                "source": source,
                "url": url,
                "date_collecte": datetime.now(UTC).isoformat(),
                "texte": None,
                "type": "image_a_ocr",
                "image_path": str(image_path),
            }
        )
        metrics.record_success(source, "image")


async def run(keywords: list[str] = SEARCH_KEYWORDS) -> dict:
    reconcile()
    urls = discover_urls(keywords)

    metrics = RunMetrics("scrape_text")
    semaphore = asyncio.Semaphore(settings.scraper_max_concurrency)
    headers = {"User-Agent": settings.scraper_user_agent}
    proxy = settings.scraper_proxy_url or None

    async with httpx.AsyncClient(headers=headers, follow_redirects=True, proxy=proxy) as client:
        await asyncio.gather(*(_process_url(client, url, semaphore, metrics) for url in urls))

    return metrics.finalize()


if __name__ == "__main__":
    summary = asyncio.run(run())
    print(
        f"{summary['total_texte']} texte(s), {summary['total_image']} image(s), "
        f"{summary['total_erreurs']} erreur(s) -> {OUTPUT_PATH}"
    )
