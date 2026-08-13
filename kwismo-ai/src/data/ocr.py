"""Extraction de texte depuis une image (capture d'ecran de message). / Text extraction from an image (message screenshot).

FR — EasyOCR plutot que Tesseract : reutilise PyTorch (deja une dependance
du Modele B) et est plus precis sur des captures de telephone reelles
(police variable, interface WhatsApp/SMS autour du texte). Support FR+EN.
EN — EasyOCR rather than Tesseract: reuses PyTorch (already a Model B
dependency) and is more accurate on real phone screenshots (variable
fonts, WhatsApp/SMS chrome around the text). FR+EN support.
"""

import json
from functools import lru_cache
from pathlib import Path

import easyocr

MESSAGES_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "scraped" / "messages.jsonl"


@lru_cache
def _reader() -> easyocr.Reader:
    return easyocr.Reader(["fr", "en"], gpu=False)


def extract_text(image_path: Path) -> str:
    """Retourne le texte detecte, lignes jointes par des sauts de ligne."""

    lines = _reader().readtext(str(image_path), detail=0, paragraph=True)
    return "\n".join(lines)


def process_pending_images(path: Path = MESSAGES_PATH) -> int:
    """FR — Parcourt messages.jsonl, OCRise les entrees "image_a_ocr" en
    attente et remplit leur champ `texte` (type -> "image_ocr"). A lancer
    apres scrape.py / scrape_social.py.
    EN — Walks messages.jsonl, OCRs pending "image_a_ocr" entries and fills
    their `texte` field (type -> "image_ocr"). Run after
    scrape.py / scrape_social.py."""

    if not path.exists():
        return 0

    records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    processed = 0
    for record in records:
        if record.get("type") != "image_a_ocr":
            continue
        image_path = Path(record["image_path"])
        if not image_path.exists():
            continue
        record["texte"] = extract_text(image_path)
        record["type"] = "image_ocr"
        processed += 1

    path.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in records) + "\n", encoding="utf-8")
    return processed


if __name__ == "__main__":
    count = process_pending_images()
    print(f"{count} image(s) OCRisee(s).")
