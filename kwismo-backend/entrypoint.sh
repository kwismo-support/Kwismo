#!/bin/sh
set -e

echo "🚀 Démarrage du script d'initialisation KWISMO Backend..."

# Configuration automatique du type de base de données
if [ -n "$DATABASE_URL" ]; then
    case "$DATABASE_URL" in
        postgres://*|postgresql://*)
            echo "🐘 Base de données PostgreSQL détectée via DATABASE_URL."
            export DB_TYPE="postgresql"
            ;;
        sqlite://*|file:*)
            echo "📁 Base de données SQLite détectée via DATABASE_URL."
            export DB_TYPE="sqlite"
            mkdir -p ./data
            ;;
        *)
            echo "ℹ️ DATABASE_URL personnalisée détectée : $DATABASE_URL"
            ;;
    esac
else
    echo "📁 Aucune DATABASE_URL fournie. Utilisation par défaut de SQLite (./data/kwismo_dev.db)."
    export DB_TYPE="sqlite"
    export DATABASE_URL="file:./data/kwismo_dev.db"
    mkdir -p ./data
fi

# Synchronisation du schéma Prisma avec le provider (SQLite vs PostgreSQL)
python scripts/sync_db_provider.py --generate || true

# Application des tables en base de données
echo "🔄 Synchronisation du schéma avec la base de données (prisma db push)..."
python -m prisma db push --accept-data-loss || prisma db push --accept-data-loss || true

# Alimentation initiale de la base de données (Seed)
echo "🌱 Exécution du seed initial (rôles, pays, opérateurs, USSD)..."
python scripts/seed.py || true

# Création du compte administrateur initial si le script existe
if [ -f "scripts/create_admin.py" ]; then
    echo "👤 Création du compte administrateur par défaut..."
    python scripts/create_admin.py || true
fi

# Démarrage du serveur backend Gunicorn / Uvicorn sur $PORT (défaut 8000)
PORT="${PORT:-8000}"
echo "✅ Démarrage du serveur KWISMO Backend sur le port $PORT..."
WORKERS="${WEB_CONCURRENCY:-2}"
exec gunicorn app.main:app -k uvicorn.workers.UvicornWorker --workers $WORKERS --timeout 120 --bind "0.0.0.0:$PORT"
