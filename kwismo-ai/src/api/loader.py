"""Charge la derniere version des modeles entraines. / Loads the latest trained model versions.

FR — Lit MODEL_DIR/registry.json pour savoir quelle version charger, puis
charge l'artefact correspondant. Appele au demarrage du service et apres
chaque reentrainement.
EN — Reads MODEL_DIR/registry.json to know which version to load, then
loads the matching artifact. Called at service startup and after every
retraining run.
"""

import json
from pathlib import Path
from typing import Any

from src.config import get_settings

settings = get_settings()


def _registry_path() -> Path:
    return Path(settings.model_dir) / "registry.json"


def read_registry() -> dict[str, Any]:
    path = _registry_path()
    if not path.exists():
        return {"model_a": None, "model_b": None}
    return json.loads(path.read_text(encoding="utf-8"))


def load_model_a():
    """Retourne le modele A charge (LightGBM), ou None si pas encore entraine."""

    registry = read_registry()
    if not registry.get("model_a"):
        return None
    # TODO: charger l'artefact .pkl indique par registry["model_a"]["path"].
    return None


def load_model_b():
    """Retourne le modele B charge (AfroXLMR ou repli TF-IDF), ou None."""

    registry = read_registry()
    if not registry.get("model_b"):
        return None
    # TODO: charger l'artefact indique par registry["model_b"]["path"].
    return None
