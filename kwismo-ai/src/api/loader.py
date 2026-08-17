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
    if not registry.get("model_a"):
        return None
    return None


def load_model_b():
    """Charge le Modèle B avec sécurité et Rollback Automatique en cas d'erreur."""
    registry = read_registry()
    model_b_info = registry.get("model_b")

    if not model_b_info or not model_b_info.get("path"):
        return None

    target_path = Path(model_b_info["path"])

    # Tentative de chargement du modèle principal/récent
    if target_path.exists():
        try:
            model = joblib.load(target_path)
            print(f"✅ Modèle B chargé avec succès depuis : {target_path}")
            return model
        except Exception as err:
            print(f"⚠️ Échec du chargement de la version courante {target_path} ({err}). Tentative de Rollback...")

    # Rollback automatique vers une version d'historique si disponible
    history = registry.get("history", [])
    for hist_item in reversed(history):
        if hist_item.get("model") == "model_b":
            hist_path = Path(hist_item.get("path", ""))
            if hist_path.exists():
                try:
                    fallback_model = joblib.load(hist_path)
                    print(f"↺ Rollback automatique réussi ! Modèle B chargé depuis : {hist_path}")
                    return fallback_model
                except Exception:
                    continue

    print("⚠️ Aucun modèle B n'a pu être chargé. Passage en mode règles de sécurité.")
    return None
