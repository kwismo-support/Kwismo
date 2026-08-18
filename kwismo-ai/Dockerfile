FROM python:3.13-slim

WORKDIR /app

# Dépendances système requises (libgomp1 pour LightGBM OpenMP, curl pour Healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --retries 10 --timeout 100 -r requirements.txt

COPY . .

RUN chmod +x ./entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["./entrypoint.sh"]
