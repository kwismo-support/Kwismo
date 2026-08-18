#!/bin/sh
set -e

echo "Démarrage du service KWISMO AI Inference..."

# 1. Vérification & Entraînement initial du Modèle A (Scoring Comportemental & Temporel)
if [ ! -f "models/model_a/model_a_v1.joblib" ]; then
    echo "Génération du jeu de données initial du Modèle A..."
    python -m src.data.generate_model_a_data || true

    echo "Entraînement initial du Modèle A (LightGBM Calibré)..."
    python -m src.models.model_a.train || true
fi

# 2. Vérification & Entraînement initial du Modèle B (NLP & Classification de Fraude)
if [ ! -f "models/model_b/model_b_fallback_v1.joblib" ]; then
    echo "Nettoyage et augmentation initiale du jeu de données du Modèle B..."
    python -m src.data.clean || true
    python -m src.data.augment || true

    echo "Entraînement initial du Modèle B (NLP Fallback / TF-IDF)..."
    python -m src.models.model_b.train || true
fi

PORT="${PORT:-8001}"
echo "Démarrage de l'API d'inférence KWISMO AI sur le port $PORT..."
exec uvicorn src.api.main:app --host 0.0.0.0 --port "$PORT"
