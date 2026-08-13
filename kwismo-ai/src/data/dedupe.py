"""Anti-doublon (texte et image) avec etat persistant. / Deduplication (text and image) with persistent state.

FR — Deux niveaux : hash SHA-256 du texte normalise (doublons exacts
republies ailleurs) et hash perceptuel (`imagehash`, pHash) pour les
captures quasi identiques (recadrees/recompressees). L'etat est garde dans
une petite base SQLite pour qu'un second passage du scraper ne retelecharge
ni ne reOCRise jamais ce qui est deja connu. `reconcile()` verifie que ce
que la base dit "deja vu" existe reellement dans data/ avant de lui faire
confiance — une suppression accidentelle de fichier ne doit jamais faire
perdre une donnee pour de bon.
EN — Two levels: SHA-256 hash of normalized text (exact duplicates
reposted elsewhere) and perceptual hash (`imagehash`, pHash) for
near-identical screenshots (cropped/recompressed). State is kept in a
small SQLite database so a second scraper run never re-downloads or
re-OCRs what's already known. `reconcile()` checks that what the database
claims is "already seen" actually still exists in data/ before trusting
it — an accidental file deletion should never permanently lose data.
"""

import hashlib
import json
import sqlite3
from pathlib import Path

import imagehash
from PIL import Image

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interim" / "scraping_state.db"
MESSAGES_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS seen_urls (url TEXT PRIMARY KEY)")
    conn.execute("CREATE TABLE IF NOT EXISTS seen_text_hashes (hash TEXT PRIMARY KEY)")
    conn.execute("CREATE TABLE IF NOT EXISTS seen_image_hashes (hash TEXT PRIMARY KEY, path TEXT)")
    return conn


def text_hash(texte: str) -> str:
    normalized = " ".join(texte.lower().split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def is_new_url(url: str) -> bool:
    with _connect() as conn:
        return conn.execute("SELECT 1 FROM seen_urls WHERE url = ?", (url,)).fetchone() is None


def claim_url(url: str) -> bool:
    """FR — Verifie ET marque "vu" en une seule operation atomique (SQLite
    serialise les ecritures) : deux appels concurrents sur la meme URL ne
    peuvent jamais tous les deux se croire "nouveaux".
    EN — Checks AND marks "seen" in a single atomic operation (SQLite
    serializes writes): two concurrent calls on the same URL can never
    both believe they're "new"."""

    with _connect() as conn:
        cur = conn.execute("INSERT OR IGNORE INTO seen_urls (url) VALUES (?)", (url,))
        return cur.rowcount > 0


def is_new_text(texte: str) -> bool:
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM seen_text_hashes WHERE hash = ?", (text_hash(texte),)
        ).fetchone()
        return row is None


def claim_text(texte: str) -> bool:
    """FR — Meme principe atomique que `claim_url`, pour le texte."""

    with _connect() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO seen_text_hashes (hash) VALUES (?)", (text_hash(texte),)
        )
        return cur.rowcount > 0


def is_new_image(image_path: Path, max_distance: int = 5) -> bool:
    """FR — Compare au hash perceptuel le plus proche deja vu (distance de Hamming)."""

    try:
        phash = imagehash.phash(Image.open(image_path))
    except Exception:
        return False
    with _connect() as conn:
        rows = conn.execute("SELECT hash FROM seen_image_hashes").fetchall()
    return all(abs(phash - imagehash.hex_to_hash(row[0])) > max_distance for row in rows)


def claim_image(image_path: Path, max_distance: int = 5) -> bool:
    """FR — Verifie ET marque "vu" en une seule transaction. Le rapprochement
    par distance perceptuelle (image quasi identique, pas seulement
    identique) garde un residu de risque de course entre deux images tres
    proches traitees a la meme milliseconde — improbable, et sans
    consequence grave (juste un doublon garde une fois de plus). Le cas
    frequent (meme image, meme hash exact, ex. logo repete sur un site) est
    lui totalement couvert par l'insertion atomique.
    EN — Checks AND marks "seen" in a single transaction. The perceptual
    (near-duplicate, not just exact) matching keeps a small residual race
    window between two near-identical images processed the same
    millisecond — unlikely, and low-consequence (just keeps one extra
    duplicate). The frequent case (same image, same exact hash, e.g. a
    logo repeated across a site) is fully covered by the atomic insert."""

    try:
        phash = imagehash.phash(Image.open(image_path))
    except Exception:
        return False
    with _connect() as conn:
        rows = conn.execute("SELECT hash FROM seen_image_hashes").fetchall()
        if any(abs(phash - imagehash.hex_to_hash(row[0])) <= max_distance for row in rows):
            return False
        cur = conn.execute(
            "INSERT OR IGNORE INTO seen_image_hashes (hash, path) VALUES (?, ?)",
            (str(phash), str(image_path)),
        )
        return cur.rowcount > 0


def reconcile(messages_path: Path = MESSAGES_PATH) -> dict[str, int]:
    """FR — A appeler au debut de chaque run, avant toute decision "deja vu".
    Retire du registre SQLite tout ce qui n'existe plus reellement (texte
    absent de messages.jsonl, image supprimee du disque) pour que ce
    contenu soit re-collecte au lieu d'etre silencieusement perdu.
    EN — Call at the start of every run, before any "already seen"
    decision. Removes from the SQLite ledger anything that no longer
    actually exists (text missing from messages.jsonl, image deleted from
    disk) so that content gets re-collected instead of silently lost.
    """

    present_text_hashes: set[str] = set()
    if messages_path.exists():
        for line in messages_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            record = json.loads(line)
            if record.get("texte"):
                present_text_hashes.add(text_hash(record["texte"]))

    removed_text = removed_image = 0
    with _connect() as conn:
        known_text = [row[0] for row in conn.execute("SELECT hash FROM seen_text_hashes").fetchall()]
        for h in known_text:
            if h not in present_text_hashes:
                conn.execute("DELETE FROM seen_text_hashes WHERE hash = ?", (h,))
                removed_text += 1

        known_images = conn.execute("SELECT hash, path FROM seen_image_hashes").fetchall()
        for h, path in known_images:
            if not path or not Path(path).exists():
                conn.execute("DELETE FROM seen_image_hashes WHERE hash = ?", (h,))
                removed_image += 1

    return {"texte_retires": removed_text, "image_retires": removed_image}
