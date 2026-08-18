"""Entraînement du Modèle A (LightGBM Calibré).

Calcule le score de réputation probabiliste continu des numéros en fonction de leur activité comportementale et temporelle.
Applique une calibration des probabilités (CalibratedClassifierCV / Platt Scaling) pour éviter les prédictions extrêmes 0.0 / 1.0.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
import lightgbm as lgb
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score

from src.config import get_settings
from src.data.features import FEATURE_COLUMNS
from src.data.generate_model_a_data import generate_dataset, OUTPUT_PATH

settings = get_settings()


def train_model_a(df: pd.DataFrame = None) -> CalibratedClassifierCV:
    """Entraîne et calibre le Modèle A LightGBM sur le jeu de données comportemental."""
    if df is None:
        if not OUTPUT_PATH.exists():
            df = generate_dataset()
        else:
            df = pd.read_csv(OUTPUT_PATH)

    x_train, x_test, y_train, y_test = train_test_split(
        df[FEATURE_COLUMNS], df["label"], test_size=0.20, random_state=42
    )

    base_model = lgb.LGBMClassifier(
        n_estimators=50,
        learning_rate=0.03,
        max_depth=3,
        min_child_samples=15,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=-1
    )

    # Calibration Sigmoïde (Platt Scaling) pour des probabilités douces et continues
    calibrated_model = CalibratedClassifierCV(estimator=base_model, method="sigmoid", cv=5)
    calibrated_model.fit(x_train, y_train)

    y_pred = calibrated_model.predict(x_test)
    y_prob = calibrated_model.predict_proba(x_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1": round(float(f1_score(y_test, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }
    print("=== Métriques d'Évaluation du Modèle A (LightGBM Calibré) ===")
    for k, v in metrics.items():
        print(f"  - {k:10s} : {v}")

    save_model_a(calibrated_model, version="v1", metrics=metrics)
    return calibrated_model


def save_model_a(model: CalibratedClassifierCV, version: str = "v1", metrics: dict = None) -> None:
    """Sauvegarde le modèle sous models/model_a/model_a_v1.joblib et met à jour registry.json."""
    model_dir = Path(settings.model_dir) / "model_a"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / f"model_a_{version}.joblib"
    
    joblib.dump(model, model_path)
    print(f"Modèle A calibré sauvegardé avec succès dans : {model_path}")

    registry_path = Path(settings.model_dir) / "registry.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {}
    
    registry["model_a"] = {
        "version": version,
        "type": "lightgbm_calibrated",
        "path": str(model_path),
        "metrics": metrics or {},
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")
    print(f"Registre mis à jour dans {registry_path}")


if __name__ == "__main__":
    train_model_a()
