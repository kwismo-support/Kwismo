"""Collecte sur Facebook, Instagram et X (majoritairement des captures d'ecran). / Collection from Facebook, Instagram and X (mostly screenshots).

FR — Ces plateformes exigent une connexion pour la quasi-totalite du
contenu : utilise un compte D'ENTREPRISE (jamais personnel), identifiants
lus depuis .env, jamais en dur dans le code. Pauses aleatoires entre
actions pour rester a un rythme humain. Les selecteurs CSS ci-dessous
changent regulierement cote plateforme : a verifier/ajuster
periodiquement — c'est la partie la plus fragile de ce fichier.
EN — These platforms require login for almost all content: uses a
COMPANY account (never personal), credentials read from .env, never
hardcoded. Random pauses between actions to stay at a human pace. The CSS
selectors below change regularly on the platform side: check/adjust
periodically — this is the most fragile part of this file.

Usage: python -m src.data.scrape_social
"""

import asyncio
import json
import random
import time
from datetime import UTC, datetime
from pathlib import Path

from playwright.async_api import Page, async_playwright

from src.config import get_settings
from src.data.dedupe import is_new_image, is_new_text, mark_image_seen, mark_text_seen

settings = get_settings()

OUTPUT_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"
IMAGES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "images"

SEARCH_KEYWORDS = [
    "arnaque mobile money cameroun",
    "arnaque orange money",
    "arnaque momo cameroun",
    "scam cameroon mobile money",
]


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
    path = IMAGES_DIR / f"{prefix}_{int(time.time() * 1000)}.png"
    response = await page.context.request.get(src)
    if not response.ok:
        return None
    path.write_bytes(await response.body())
    return path


async def _record_text(source: str, url: str, texte: str) -> bool:
    texte = texte.strip()
    if not texte or not is_new_text(texte):
        return False
    mark_text_seen(texte)
    _append_record(
        {
            "source": source,
            "url": url,
            "date_collecte": datetime.now(UTC).isoformat(),
            "texte": texte,
            "type": "texte",
        }
    )
    return True


async def _record_image(source: str, url: str, image_path: Path) -> bool:
    if not is_new_image(image_path):
        image_path.unlink(missing_ok=True)
        return False
    mark_image_seen(image_path)
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
    return True


# --- Facebook --------------------------------------------------------------


async def login_facebook(page: Page) -> None:
    await page.goto("https://www.facebook.com/login")
    await page.fill("#email", settings.facebook_username)
    await page.fill("#pass", settings.facebook_password)
    await page.click('button[name="login"]')
    await page.wait_for_load_state("networkidle")


async def scrape_facebook(page: Page, keyword: str, max_posts: int = 20) -> int:
    await page.goto(f"https://www.facebook.com/search/posts/?q={keyword}")
    await _human_pause()

    # TODO: selecteur a verifier/ajuster - Facebook change regulierement sa structure DOM.
    posts = await page.query_selector_all('[role="article"]')

    collected = 0
    for post in posts[:max_posts]:
        texte = await post.inner_text()
        if await _record_text("facebook", page.url, texte):
            collected += 1

        for img in await post.query_selector_all("img"):
            src = await img.get_attribute("src")
            if not src:
                continue
            image_path = await _save_image(page, src, "facebook")
            if image_path and await _record_image("facebook", page.url, image_path):
                collected += 1

        await _human_pause()
    return collected


# --- Instagram ---------------------------------------------------------------


async def login_instagram(page: Page) -> None:
    await page.goto("https://www.instagram.com/accounts/login/")
    await page.fill('input[name="username"]', settings.instagram_username)
    await page.fill('input[name="password"]', settings.instagram_password)
    await page.click('button[type="submit"]')
    await page.wait_for_load_state("networkidle")


async def scrape_instagram(page: Page, keyword: str, max_posts: int = 20) -> int:
    # TODO: Instagram n'a pas de recherche texte plein directe - passer par un
    # hashtag (#arnaquecameroun, #momoscam...) et suivre le meme schema que
    # scrape_facebook (extraire legende + images de chaque post, _record_text /
    # _record_image, pause humaine entre chaque post).
    raise NotImplementedError


# --- X (Twitter) --------------------------------------------------------------


async def login_x(page: Page) -> None:
    await page.goto("https://x.com/login")
    await page.fill('input[autocomplete="username"]', settings.x_username)
    await page.click("text=Next")
    await page.fill('input[type="password"]', settings.x_password)
    await page.click("text=Log in")
    await page.wait_for_load_state("networkidle")


async def scrape_x(page: Page, keyword: str, max_posts: int = 20) -> int:
    # TODO: memes principes que scrape_facebook - recherche par mot-cle
    # (https://x.com/search?q=...), parcourir les tweets, extraire texte +
    # images jointes.
    raise NotImplementedError


# --- Orchestration -------------------------------------------------------------


async def run(keywords: list[str] = SEARCH_KEYWORDS) -> int:
    total = 0
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        if settings.facebook_username:
            await login_facebook(page)
            for keyword in keywords:
                total += await scrape_facebook(page, keyword)
                await _human_pause()

        # Instagram/X : decommenter une fois scrape_instagram/scrape_x completes.
        # if settings.instagram_username:
        #     await login_instagram(page)
        #     for keyword in keywords:
        #         total += await scrape_instagram(page, keyword)
        # if settings.x_username:
        #     await login_x(page)
        #     for keyword in keywords:
        #         total += await scrape_x(page, keyword)

        await browser.close()
    return total


if __name__ == "__main__":
    count = asyncio.run(run())
    print(f"{count} nouvel(le) entree(s) collectee(s) -> {OUTPUT_PATH}")
