"""Anti-doublon (texte et image) avec etat persistant. / Deduplication (text and image) with persistent state.

FR — Deux niveaux : hash SHA-256 du texte normalise (doublons exacts
republies ailleurs) et hash perceptuel (`imagehash`, pHash) pour les
captures quasi identiques (recadrees/recompressees). L'etat est garde dans
une petite base SQLite pour qu'un second passage du scraper ne retelecharge
ni ne reOCRise jamais ce qui est deja connu.
EN — Two levels: SHA-256 hash of normalized text (exact duplicates
reposted elsewhere) and perceptual hash (`imagehash`, pHash) for
near-identical screenshots (cropped/recompressed). State is kept in a
small SQLite database so a second scraper run never re-downloads or
re-OCRs what's already known.
"""

import hashlib
import sqlite3
from pathlib import Path

import imagehash
from PIL import Image

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interim" / "scraping_state.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS seen_urls (url TEXT PRIMARY KEY)")
    conn.execute("CREATE TABLE IF NOT EXISTS seen_text_hashes (hash TEXT PRIMARY KEY)")
    conn.execute("CREATE TABLE IF NOT EXISTS seen_image_hashes (hash TEXT PRIMARY KEY)")
    return conn


def text_hash(texte: str) -> str:
    normalized = " ".join(texte.lower().split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def is_new_url(url: str) -> bool:
    with _connect() as conn:
        return conn.execute("SELECT 1 FROM seen_urls WHERE url = ?", (url,)).fetchone() is None


def mark_url_seen(url: str) -> None:
    with _connect() as conn:
        conn.execute("INSERT OR IGNORE INTO seen_urls (url) VALUES (?)", (url,))


def is_new_text(texte: str) -> bool:
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM seen_text_hashes WHERE hash = ?", (text_hash(texte),)
        ).fetchone()
        return row is None


def mark_text_seen(texte: str) -> None:
    with _connect() as conn:
        conn.execute("INSERT OR IGNORE INTO seen_text_hashes (hash) VALUES (?)", (text_hash(texte),))


def is_new_image(image_path: Path, max_distance: int = 5) -> bool:
    """FR — Compare au hash perceptuel le plus proche deja vu (distance de Hamming)."""

    phash = imagehash.phash(Image.open(image_path))
    with _connect() as conn:
        rows = conn.execute("SELECT hash FROM seen_image_hashes").fetchall()
    return all(abs(phash - imagehash.hex_to_hash(row[0])) > max_distance for row in rows)


def mark_image_seen(image_path: Path) -> None:
    phash = imagehash.phash(Image.open(image_path))
    with _connect() as conn:
        conn.execute("INSERT OR IGNORE INTO seen_image_hashes (hash) VALUES (?)", (str(phash),))
