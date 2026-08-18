#!/bin/sh
set -e

echo "🚀 Démarrage du service KWISMO AI Inference..."

# Génération du dataset et entraînement si les modèles n'existent pas
if [ ! -f "models/model_a/model_a_v1.joblib" ]; then
    echo "📊 Génération du jeu de données initial du Modèle A..."
    python -m src.data.generate_model_a_data || true

    echo "🤖 Entraînement initial du Modèle A (LightGBM Calibré)..."
    python -m src.models.model_a.train || true
fi

PORT="${PORT:-8001}"
echo "✅ Démarrage de l'API d'inférence KWISMO AI sur le port $PORT..."
exec uvicorn src.api.main:app --host 0.0.0.0 --port "$PORT"
