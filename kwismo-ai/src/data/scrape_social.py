"""Collecte sur Facebook, Instagram et X (majoritairement des captures d'ecran). / Collection from Facebook, Instagram and X (mostly screenshots).

FR — Ces plateformes exigent une connexion pour la quasi-totalite du
contenu : utilise des comptes D'ENTREPRISE (jamais personnels), identifiants
lus depuis .env, jamais en dur. Plusieurs comptes peuvent etre configures
par plateforme (FACEBOOK_ACCOUNTS="user1:pass1,user2:pass2") : ils sont
essayes DANS L'ORDRE au demarrage. Ce module ne bascule PAS automatiquement
de compte en cours de session si un blocage est detecte apres coup — il
s'arrete et journalise clairement, pour qu'un humain juge de la suite
plutot qu'une boucle d'evasion silencieuse. Aucune usurpation d'empreinte
navigateur (Playwright standard).

Les selecteurs CSS ci-dessous changent regulierement cote plateforme : a
verifier/ajuster periodiquement — c'est la partie la plus fragile de ce
fichier.

EN — These platforms require login for almost all content: uses COMPANY
accounts (never personal), credentials read from .env, never hardcoded.
Several accounts can be configured per platform
(FACEBOOK_ACCOUNTS="user1:pass1,user2:pass2"): they're tried IN ORDER at
startup. This module does NOT automatically switch accounts mid-session if
a block is detected afterwards — it stops and logs clearly, so a human
judges what's next instead of a silent evasion loop. No browser fingerprint
spoofing (standard Playwright).

The CSS selectors below change regularly on the platform side: check/adjust
periodically — this is the most fragile part of this file.

Usage: python -m src.data.scrape_social
"""

import asyncio
import hashlib
import json
import random
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime
from pathlib import Path

from playwright.async_api import Page, async_playwright

from src.config import get_settings
from src.data.dedupe import claim_image, claim_text, reconcile
from src.data.metrics import RunMetrics
from src.data.scrape import SEARCH_KEYWORDS, is_relevant

settings = get_settings()

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"
IMAGES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "images"


async def _human_pause() -> None:
    await asyncio.sleep(random.uniform(settings.scraper_delay_seconds, settings.scraper_delay_seconds * 2))


def _append_record(record: dict) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


async def _save_image(page: Page, src: str, prefix: str) -> Path | None:
    if not src.startswith("http"):
        return None
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.md5(src.encode("utf-8")).hexdigest()[:16]
    path = IMAGES_DIR / f"{prefix}_{digest}.png"
    try:
        response = await page.context.request.get(src)
    except Exception:
        return None
    if not response.ok:
        return None
    path.write_bytes(await response.body())
    return path


async def _record_text(source: str, url: str, texte: str, metrics: RunMetrics) -> None:
    texte = texte.strip()
    if not texte or not is_relevant(texte) or not claim_text(texte):
        return
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


async def _record_image(source: str, url: str, image_path: Path, metrics: RunMetrics) -> None:
    if not claim_image(image_path):
        image_path.unlink(missing_ok=True)
        return
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


# --- Connexion avec repli sur plusieurs comptes, sans bascule silencieuse ----


async def _login_with_fallback(
    page: Page,
    platform: str,
    accounts: list[tuple[str, str]],
    login_fn: Callable[[Page, str, str], Awaitable[None]],
    success_check: Callable[[Page], Awaitable[bool]],
) -> str | None:
    for username, password in accounts:
        try:
            await login_fn(page, username, password)
            if await success_check(page):
                print(f"[{platform}] connecte avec le compte {username}")
                return username
            print(f"[{platform}] echec de connexion (verification post-login) avec {username}")
        except Exception as exc:
            print(f"[{platform}] erreur de connexion avec {username} : {exc}")
        await _human_pause()
    print(f"[{platform}] tous les comptes configures ont echoue -> arret pour cette plateforme.")
    return None


# --- Facebook --------------------------------------------------------------


async def login_facebook(page: Page, username: str, password: str) -> None:
    await page.goto("https://www.facebook.com/login")
    await page.fill("#email", username)
    await page.fill("#pass", password)
    await page.click('button[name="login"]')
    await page.wait_for_load_state("networkidle")


async def _facebook_login_ok(page: Page) -> bool:
    # TODO: verification best-effort - a affiner (ex. presence d'un element du fil d'actualite).
    return "login" not in page.url


async def scrape_facebook(page: Page, keyword: str, metrics: RunMetrics, max_posts: int = 20) -> None:
    await page.goto(f"https://www.facebook.com/search/posts/?q={keyword}")
    await _human_pause()

    # TODO: selecteur a verifier/ajuster - Facebook change regulierement sa structure DOM.
    posts = await page.query_selector_all('[role="article"]')

    for post in posts[:max_posts]:
        try:
            texte = await post.inner_text()
            await _record_text("facebook", page.url, texte, metrics)

            for img in await post.query_selector_all("img"):
                src = await img.get_attribute("src")
                if not src:
                    continue
                image_path = await _save_image(page, src, "facebook")
                if image_path:
                    await _record_image("facebook", page.url, image_path, metrics)
        except Exception:
            metrics.record_error("facebook")
        await _human_pause()


# --- Instagram ---------------------------------------------------------------


async def login_instagram(page: Page, username: str, password: str) -> None:
    await page.goto("https://www.instagram.com/accounts/login/")
    await page.fill('input[name="username"]', username)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await page.wait_for_load_state("networkidle")


async def _instagram_login_ok(page: Page) -> bool:
    return "accounts/login" not in page.url


async def scrape_instagram(page: Page, keyword: str, metrics: RunMetrics, max_posts: int = 20) -> None:
    # TODO: Instagram n'a pas de recherche texte plein directe - passer par un
    # hashtag (#arnaquecameroun, #momoscam...) et suivre le meme schema que
    # scrape_facebook (extraire legende + images de chaque post, _record_text /
    # _record_image, pause humaine entre chaque post, metrics.record_error en cas de souci).
    raise NotImplementedError


# --- X (Twitter) --------------------------------------------------------------


async def login_x(page: Page, username: str, password: str) -> None:
    await page.goto("https://x.com/login")
    await page.fill('input[autocomplete="username"]', username)
    await page.click("text=Next")
    await page.fill('input[type="password"]', password)
    await page.click("text=Log in")
    await page.wait_for_load_state("networkidle")


async def _x_login_ok(page: Page) -> bool:
    return "login" not in page.url


async def scrape_x(page: Page, keyword: str, metrics: RunMetrics, max_posts: int = 20) -> None:
    # TODO: memes principes que scrape_facebook - recherche par mot-cle
    # (https://x.com/search?q=...), parcourir les tweets, extraire texte +
    # images jointes, metrics.record_error en cas de souci.
    raise NotImplementedError


# --- Orchestration -------------------------------------------------------------


async def run(keywords: list[str] = SEARCH_KEYWORDS) -> dict:
    reconcile()
    metrics = RunMetrics("scrape_social")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        if settings.facebook_accounts_list:
            account = await _login_with_fallback(
                page, "facebook", settings.facebook_accounts_list, login_facebook, _facebook_login_ok
            )
            if account:
                for keyword in keywords:
                    await scrape_facebook(page, keyword, metrics)
                    await _human_pause()

        if settings.instagram_accounts_list:
            account = await _login_with_fallback(
                page, "instagram", settings.instagram_accounts_list, login_instagram, _instagram_login_ok
            )
            if account:
                for keyword in keywords:
                    try:
                        await scrape_instagram(page, keyword, metrics)
                    except NotImplementedError:
                        print("[instagram] scrape_instagram pas encore implemente, ignore.")
                        break
                    await _human_pause()

        if settings.x_accounts_list:
            account = await _login_with_fallback(page, "x", settings.x_accounts_list, login_x, _x_login_ok)
            if account:
                for keyword in keywords:
                    try:
                        await scrape_x(page, keyword, metrics)
                    except NotImplementedError:
                        print("[x] scrape_x pas encore implemente, ignore.")
                        break
                    await _human_pause()

        await browser.close()

    return metrics.finalize()


if __name__ == "__main__":
    summary = asyncio.run(run())
    print(
        f"{summary['total_texte']} texte(s), {summary['total_image']} image(s), "
        f"{summary['total_erreurs']} erreur(s) -> {OUTPUT_PATH}"
    )
