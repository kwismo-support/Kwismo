"""Entrainement du Modele A (LightGBM). / Model A training (LightGBM).

Usage: python -m src.models.model_a.train
"""

import json
from datetime import UTC, datetime
from pathlib import Path

import lightgbm as lgb
import pandas as pd
from sklearn.model_selection import train_test_split

from src.config import get_settings
from src.data.features import FEATURE_COLUMNS
from src.evaluation.metrics import evaluate

settings = get_settings()


def train(df: pd.DataFrame, label_col: str = "label") -> lgb.LGBMClassifier:
    x_train, x_test, y_train, y_test = train_test_split(
        df[FEATURE_COLUMNS], df[label_col], test_size=0.15, random_state=42
    )
    model = lgb.LGBMClassifier()
    model.fit(x_train, y_train)
    metrics = evaluate(y_test, model.predict(x_test))
    print("Metriques Modele A :", metrics)
    return model


def save(model: lgb.LGBMClassifier, version: str) -> None:
    model_dir = Path(settings.model_dir) / "model_a"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / f"model_a_{version}.pkl"
    # model.booster_.save_model(str(model_path))  # TODO: activer une fois le modele reel entraine.

    registry_path = Path(settings.model_dir) / "registry.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {}
    registry["model_a"] = {
        "version": version,
        "path": str(model_path),
        "trained_at": datetime.now(UTC).isoformat(),
    }
    registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit("Fournir un DataFrame de features + labels avant de lancer l'entrainement.")
