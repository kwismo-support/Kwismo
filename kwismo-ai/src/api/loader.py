"""Chargement dynamique, gestion des versions et rollback automatique des modèles (kwismo-ai).

Lit MODEL_DIR/registry.json et charge les artefacts de modèles. En cas d'erreur de chargement
sur la dernière version, applique un rollback automatique sur la version précédente.
"""

import json
from pathlib import Path
from typing import Any
import joblib

from src.config import get_settings

settings = get_settings()


def _registry_path() -> Path:
    return Path(settings.model_dir) / "registry.json"


def read_registry() -> dict[str, Any]:
    path = _registry_path()
    if not path.exists():
        return {"model_a": None, "model_b": None, "history": []}
    return json.loads(path.read_text(encoding="utf-8"))


def load_model_a():
    """Charge le Modèle A (LightGBM). Retourne None si pas encore prêt."""
    registry = read_registry()
    model_a_info = registry.get("model_a")
    if not model_a_info or not model_a_info.get("path"):
        return None

    target_path = Path(model_a_info["path"])
    if target_path.exists():
        try:
            return joblib.load(target_path)
        except Exception as err:
            print(f"⚠️ Erreur lors du chargement du Modèle A ({target_path}) : {err}")
            return None
    return None


def load_model_b():
    """Charge le Modèle B avec sécurité et Rollback Automatique en cas d'erreur."""
    registry = read_registry()
    model_b_info = registry.get("model_b")

    if not model_b_info or not model_b_info.get("path"):
        return None

    target_path = Path(model_b_info["path"])

    if target_path.exists():
        try:
            return joblib.load(target_path)
        except Exception as err:
            print(f"⚠️ Erreur lors du chargement de la version courante de Modèle B ({target_path}) : {err}")

    # Tentative de rollback sur l'historique
    history = registry.get("history", [])
    for old_entry in reversed(history):
        if old_entry.get("model") == "model_b" and old_entry.get("path"):
            old_path = Path(old_entry["path"])
            if old_path.exists():
                try:
                    print(f"🔄 Rollback automatique du Modèle B vers la version antérieure : {old_path}")
                    return joblib.load(old_path)
                except Exception:
                    continue

    return None
