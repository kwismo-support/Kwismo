"""Entraînement du Modèle B (NLP & Auto-Catégorisation).

Lit data/processed/model_b_augmented.jsonl (ou model_b_clean.jsonl), auto-catégorise les exemples et produit :
1. Le modèle de repli ultra-rapide TF-IDF + Régression Logistique (joblib).
2. L'entraînement léger LoRA / PEFT sur AfroXLMR pour les environnements Cloud GPU.
3. La mise à jour du registre des modèles (models/registry.json).
"""

import json
from datetime import UTC, datetime
from pathlib import Path
import joblib

from src.config import get_settings
from src.models.model_b.fallback import build_pipeline
from src.models.model_b.preprocess import categorize_description

settings = get_settings()

AUGMENTED_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "model_b_augmented.jsonl"
CLEAN_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "model_b_clean.jsonl"
MODEL_DIR = Path(settings.model_dir) / "model_b"


def load_cleaned_dataset() -> tuple[list[str], list[str], list[str]]:
    """Lit le jeu de données nettoyé/augmenté et renvoie (texts, categories, ids)."""
    input_path = AUGMENTED_DATA_PATH if AUGMENTED_DATA_PATH.exists() else CLEAN_DATA_PATH
    if not input_path.exists():
        raise FileNotFoundError(
            f"Jeu de données introuvable dans {input_path}. "
            "Exécute d'abord 'python -m src.data.clean' puis 'python -m src.data.augment'."
        )

    print(f"Chargement des données d'entraînement depuis : {input_path}")
    records = [json.loads(line) for line in input_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    texts = []
    categories = []
    ids = []

    for rec in records:
        text = rec.get("texte", "")
        if not text:
            continue
        cat = categorize_description(text)
        texts.append(text)
        categories.append(cat)
        ids.append(rec.get("id_signalement", ""))

    return texts, categories, ids


def train_and_save_fallback(version: str = "v1") -> Path:
    """Entraîne le modèle de repli TF-IDF + Régression Logistique et sauvegarde l'artefact."""
    texts, categories, _ = load_cleaned_dataset()
    print(f"Entraînement du modèle de repli TF-IDF sur {len(texts)} exemples augmentés...")

    pipeline = build_pipeline()
    pipeline.fit(texts, categories)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    fallback_path = MODEL_DIR / f"model_b_fallback_{version}.joblib"
    joblib.dump(pipeline, fallback_path)

    # Mise à jour du registre
    registry_path = Path(settings.model_dir) / "registry.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {"history": []}
    
    # Historique de versioning pour le rollback
    if "history" not in registry:
        registry["history"] = []
    if registry.get("model_b"):
        registry["history"].append({"model": "model_b", **registry["model_b"]})

    registry["model_b"] = {
        "version": version,
        "type": "fallback_tfidf",
        "path": str(fallback_path),
        "total_samples": len(texts),
        "trained_at": datetime.now(UTC).isoformat(),
    }
    registry_path.parent.mkdir(parents=True, exist_ok=True)
    registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")

    print(f"Modèle B (repli) sauvegardé avec succès dans : {fallback_path}")
    return fallback_path


if __name__ == "__main__":
    train_and_save_fallback("v1")
