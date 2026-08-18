FROM python:3.13-slim

WORKDIR /app

# Dépendances système requises (OpenSSL & libatomic pour Prisma Engine/Node, curl pour Healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --retries 10 --timeout 100 -r requirements.txt

COPY . .

# Génération initiale du client Prisma Python
RUN prisma generate

# Droits d'exécution sur l'entrypoint
RUN chmod +x ./entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
