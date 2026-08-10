# KWISMO — Modèle IA

## Détection de fraude · Scoring de numéros + NLP africain · Léger & efficace

[![Python](https://img.shields.io/badge/Python-3.11+-5B5CD6)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-LightGBM-2FAC66)](https://scikit-learn.org)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-AfroXLMR-F39200)](https://huggingface.co)

---

## Table des matières

1. [Description](#1-description)
2. [Les deux modèles](#2-les-deux-modèles)
3. [Stack technique](#3-stack-technique)
4. [Prérequis](#4-prérequis)
5. [Installation & démarrage](#5-installation--démarrage)
6. [Commandes utiles](#6-commandes-utiles)
7. [Structure complète des dossiers et fichiers](#7-structure-complète-des-dossiers-et-fichiers)
8. [Rôle de chaque dossier](#8-rôle-de-chaque-dossier)
9. [Cycle d'entraînement](#9-cycle-dentraînement)
10. [Contrainte : léger, rapide, efficace](#10-contrainte--léger-rapide-efficace)
11. [API d'inférence](#11-api-dinférence)
12. [Intégration avec le backend](#12-intégration-avec-le-backend)
13. [Variables d'environnement](#13-variables-denvironnement)
14. [Collecte de données (scraping) & entraînement sur Google Colab](#14-collecte-de-données-scraping--entraînement-sur-google-colab)

---

## 1. Description

Le service IA détecte les **numéros** et **messages** frauduleux liés au Mobile Money. Il :

- **ne se connecte jamais à la base de données** — il reçoit ses données via le backend et lui renvoie ses prédictions ;
- expose une **API d'inférence** (FastAPI) appelée par le backend ;
- est conçu pour être **léger** : l'entraînement ne sature ni le PC ni le serveur, quelle que soit la taille des données.

---

## 2. Les deux modèles

| Modèle | Rôle | Donnée | Technique |
| ------ | ---- | ------ | --------- |
| **Modèle A** — Scoring | Risque d'un numéro (sécurisé/suspect/frauduleux). | Comportement (signalements, ancienneté, opérateur…). | LightGBM (arbres boostés), CPU, minutes. |
| **Modèle B** — NLP | Un message est-il une arnaque ? | Texte FR/EN/pidgin/franglais. | AfroXLMR affiné (fine-tuning léger) + repli TF-IDF. |

> Les deux vivent dans le **même dossier**, développés en parallèle par les deux data scientists.

---

## 3. Stack technique

| Usage | Bibliothèque |
| ----- | ------------ |
| Manipulation de données | Pandas, NumPy |
| Modèle A (scoring) | scikit-learn, LightGBM |
| Modèle B (NLP) | Hugging Face Transformers, PyTorch, PEFT (LoRA) |
| Repli NLP | scikit-learn (TF-IDF + régression logistique) |
| Service d'inférence | FastAPI + Uvicorn |
| Suivi d'expériences | MLflow *(ou registre JSON simple)* |
| Qualité & tests | pytest, Ruff, Black |

---

## 4. Prérequis

```bash
python --version    # 3.13 (obligatoire)
```

- Un **PC** suffit pour le Modèle A et l'inférence.
- Pour l'entraînement du **Modèle B** (fine-tuning), un **GPU gratuit (Google Colab / Kaggle)** est recommandé mais non obligatoire (repli TF-IDF possible sur CPU).

---

## 5. Installation & démarrage

```bash
# 1. Se placer dans le dossier
cd kwismo-ai

# 2. Vérifier que Python 3.13 est installé (obligatoire)
check_python.bat                              # Windows : double-clic ou en ligne de commande
python3.13 scripts/check_python_version.py    # macOS / Linux

# 3. Créer et activer un environnement virtuel (Python 3.13)
py -3.13 -m venv .venv                        # Windows
python3.13 -m venv .venv                      # macOS / Linux
source .venv/bin/activate                     # Windows : .venv\Scripts\activate

# 4. Installer les dépendances
pip install -e .

# 5. Configurer l'environnement
cp .env.example .env
#   → éditer BACKEND_URL, MODEL_DIR…

# 6. Lancer le service d'inférence
uvicorn src.api.main:app --reload --port 8001
```

Le service tourne sur **[API](http://localhost:8001)** — documentation sur **[API Docs](http://localhost:8001/docs)**.

> **Python 3.13 imposé, à trois niveaux.** `check_python.bat` (ou `scripts/check_python_version.py`) vérifie *avant* la création du venv. `pip install -e .` s'appuie sur `requires-python` (pyproject.toml) pour que pip lui-même refuse d'installer sur la mauvaise version. `src/__init__.py` vérifie *à l'exécution* : toute méthode qui importe le package `src` (`uvicorn`, l'entraînement des modèles, `pytest`…) échoue immédiatement avec un message clair si Python 3.13 n'est pas utilisé. Seul `pip install -r requirements.txt` pris isolément n'a pas de garde-fou natif — pip n'exécute aucune vérification sur un simple fichier de dépendances, d'où les deux autres niveaux.

### Avec Docker (depuis la racine du monorepo)

```bash
docker compose up --build ai
```

---

## 6. Commandes utiles

| Commande | Effet |
| -------- | ----- |
| `uvicorn src.api.main:app --reload --port 8001` | Démarre le service d'inférence. |
| `python -m src.models.model_a.train` | Entraîne le Modèle A (scoring). |
| `python -m src.models.model_b.train` | Entraîne le Modèle B (NLP). |
| `python -m src.evaluation.metrics` | Évalue les modèles (rappel, précision, F1). |
| `python -m src.data.scrape` | Scrape les sources texte (presse/institutionnel) → `data/raw/scraped/`. |
| `python -m src.data.scrape_social` | Scrape Facebook/Instagram/X (compte d'entreprise requis, §14). |
| `python -m src.data.ocr` | OCRise les captures en attente (`type: "image_a_ocr"`). |
| `jupyter notebook notebooks/` | Ouvre les notebooks d'exploration/entraînement. |
| `pytest` | Lance les tests. |
| `ruff check . && black .` | Vérifie la qualité du code. |

> Les notebooks `02_train_model_a.ipynb` et `03_train_model_b.ipynb` s'exécutent aussi bien en local que sur **Google Colab** (même code source importé depuis `src/`).

---

## 7. Structure complète des dossiers et fichiers

```text
kwismo-ai/
│
├─ data/                            # Données (NON versionnées si sensibles)
│  ├─ raw/                          # Données brutes reçues (via le backend) ou scrapées
│  │  ├─ .gitkeep
│  │  └─ scraped/                   # ★ Sortie du scraping (§14)
│  │     ├─ messages.jsonl          # ★ Versionné : texte + résultat OCR, sans étiquette
│  │     └─ images/                 # Captures brutes — NON versionné, à synchroniser sur Drive
│  ├─ interim/                      # Données nettoyées intermédiaires (+ scraping_state.db, anti-doublon)
│  │  └─ .gitkeep
│  └─ processed/                    # Données prêtes pour l'entraînement
│     └─ .gitkeep
│
├─ notebooks/                       # Exploration & entraînement (local + Colab)
│  ├─ 01_exploration.ipynb          # Analyse exploratoire des données
│  ├─ 02_train_model_a.ipynb        # Entraînement scoring (interactif)
│  └─ 03_train_model_b.ipynb        # Fine-tuning NLP AfroXLMR (Colab)
│
├─ src/                             # ★ Code source réutilisable
│  ├─ __init__.py                   # Signale une erreur si mauvaise version Python
│  ├─ config.py                     # Settings Pydantic : BACKEND_URL, MODEL_DIR, seuils…
│  │
│  ├─ data/
│  │  ├─ __init__.py
│  │  ├─ collect.py                 # Réception des données depuis le backend
│  │  ├─ clean.py                   # Nettoyage
│  │  ├─ features.py                # Construction des caractéristiques (Modèle A)
│  │  ├─ scrape.py                  # ★ Scraping sources texte (presse/institutionnel), §14
│  │  ├─ scrape_social.py           # ★ Scraping Facebook/Instagram/X (Playwright), §14
│  │  ├─ ocr.py                     # ★ Texte depuis capture d'écran (EasyOCR), §14
│  │  └─ dedupe.py                  # ★ Anti-doublon texte + image (SQLite), §14
│  │
│  ├─ models/
│  │  ├─ __init__.py
│  │  │
│  │  ├─ model_a/                   # Scoring de réputation des numéros
│  │  │  ├─ __init__.py
│  │  │  ├─ train.py                # Entraînement LightGBM
│  │  │  ├─ predict.py              # Inférence (score + statut)
│  │  │  └─ rules.py                # Règles expertes (démarrage à froid / repli)
│  │  │
│  │  └─ model_b/                   # NLP multilingue (arnaque texte)
│  │     ├─ __init__.py
│  │     ├─ preprocess.py           # Prétraitement franglais/pidgin
│  │     ├─ train.py                # Fine-tuning AfroXLMR (PEFT/LoRA) — Colab/PC
│  │     ├─ predict.py              # Inférence (probabilité d'arnaque)
│  │     └─ fallback.py             # Repli TF-IDF + régression logistique
│  │
│  ├─ evaluation/
│  │  ├─ __init__.py
│  │  └─ metrics.py                 # Rappel, précision, F1, matrice de confusion
│  │
│  └─ api/                          # ★ Service d'inférence (FastAPI)
│     ├─ __init__.py
│     ├─ main.py                    # ★ 5 routes : /predict/number, /predict/text, /feedback, /health, /version
│     ├─ schemas.py                 # ★ Contrat d'API PARTAGÉ, identique à kwismo-backend/app/modules/ai_gateway/schemas.py
│     ├─ errors.py                  # ★ slowapi (anti-surcharge) + gestionnaires d'erreurs globaux (anti-crash)
│     ├─ middleware.py              # ★ Limite de taille de requête (texte trop long → 413)
│     └─ loader.py                  # Charge la dernière version du modèle
│
├─ models/                          # ★ Artefacts entraînés (partagés au backend)
│  ├─ model_a/
│  │  └─ .gitkeep                   # ex. model_a_v3.pkl (généré à l'entraînement)
│  ├─ model_b/
│  │  └─ .gitkeep                   # modèle NLP quantifié
│  └─ registry.json                 # Versions + métriques (versioning)
│
├─ tests/
│  ├─ __init__.py
│  ├─ test_features.py
│  ├─ test_model_a.py
│  ├─ test_model_b.py
│  └─ test_api.py
│
├─ scripts/
│  └─ check_python_version.py       # Fichier de vérification de Python 3.13
│
├─ check_python.bat                 # Vérifie Python 3.13 avant de démarrer
├─ .env                             # Variables réelles (NON versionné)
├─ .env.example
├─ .gitignore
├─ .dockerignore
├─ Dockerfile                       # Image du service d'inférence
├─ requirements.txt                 # scikit-learn, lightgbm, transformers, playwright, easyocr…
├─ pyproject.toml                   # requires-python + dependencies (pip install -e .)
├─ COLAB.md                         # ★ Guide complet : lancer les notebooks sur Google Colab (§14)
└─ README.md                        # Ce fichier
```

---

## 8. Rôle de chaque dossier

| Dossier | Rôle | Point de vigilance |
| ------- | ---- | ------------------ |
| `data/` | Données brutes → nettoyées → prêtes. | Jamais versionnées si sensibles (voir `.gitignore`). |
| `notebooks/` | Exploration & entraînement interactif. | Le code réutilisable va dans `src/`, pas dans les notebooks. |
| `src/data/` | Pipeline : collecte, nettoyage, features. | La collecte se fait **via le backend**, jamais en base directe. |
| `src/models/model_a/` | Scoring + règles expertes. | Léger, entraînable sur CPU. |
| `src/models/model_b/` | NLP AfroXLMR + repli TF-IDF. | Entraînement lourd déporté (Colab), jamais sur le serveur. |
| `src/api/` | Service d'inférence FastAPI. | `schemas.py` = contrat partagé avec le backend. |
| `models/` | **Artefacts entraînés partagés au backend.** | Emplacement monté en volume ; chargé par `loader.py`. |

**Le pont avec le backend** : le dossier `models/` est l'emplacement partagé (volume Docker). Quand l'entraînement se termine, l'artefact y est déposé ; `src/api/loader.py` le charge et le backend l'utilise via l'API — **sans manipulation manuelle**.

---

## 9. Cycle d'entraînement

Le cycle est le même pour les deux modèles :

1. **Collecter** des exemples étiquetés (`src/data/collect.py`).
2. **Préparer** : nettoyer + features (`clean.py`, `features.py` / `preprocess.py`).
3. **Séparer** en entraînement / validation / test.
4. **Entraîner** (`model_a/train.py` ou `model_b/train.py`).
5. **Évaluer** (`src/evaluation/metrics.py`).
6. **Déployer** : l'artefact va dans `models/`, chargé par le service.
7. **Boucler** : les nouveaux signalements (`/feedback`) réentraînent le modèle.

---

## 10. Contrainte : léger, rapide, efficace

| Aspect | Garantie |
| ------ | -------- |
| **Production (serveur)** | Uniquement de l'inférence (prédiction quasi instantanée). Jamais d'entraînement lourd. |
| **Modèle A** | LightGBM sur CPU : entraînement en minutes, même avec beaucoup de données. |
| **Modèle B** | Entraînement déporté sur Colab/PC ; techniques d'allègement : **PEFT/LoRA** (on n'entraîne qu'une petite partie), **quantification** (modèle final léger), petits lots + early stopping. |
| **Repli garanti** | Si le fine-tuning est trop lourd, `model_b/fallback.py` (TF-IDF) tourne sur n'importe quel PC. |
| **Apprentissage continu** | Mises à jour incrémentales et planifiées, jamais un réentraînement complet à chaque requête. |

---

## 11. API d'inférence

| Route | Rôle |
| ----- | ---- |
| `POST /predict/number` | Reçoit les caractéristiques d'un numéro → score + statut (Modèle A). |
| `POST /predict/text` | Reçoit un message → probabilité d'arnaque (Modèle B). |
| `POST /feedback` | Reçoit une donnée étiquetée (signalement) pour l'apprentissage continu. |
| `GET /health` | État du service. |
| `GET /version` | Version du modèle chargé. |

Documentation interactive : **[API Docs](http://localhost:8001/docs)**.

---

## 12. Intégration avec le backend

- Le **backend appelle** le service IA (`POST /predict/*`) — l'IA ne parle jamais à l'app ni à la base directement.
- **Contrat partagé** : `src/api/schemas.py` (IA) doit rester **identique** à `app/modules/ai_gateway/schemas.py` (backend).
- **Repli** : si l'IA est indisponible, le backend applique ses règles expertes → l'utilisateur n'est jamais bloqué.
- **Orchestration** : le `docker-compose.yml` à la racine du monorepo démarre backend + base + IA ensemble, avec `AI_SERVICE_URL` et `MODEL_DIR` déjà câblés.

---

## 13. Variables d'environnement

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `BACKEND_URL` | `http://localhost:8000` | URL du backend (source des données). |
| `MODEL_DIR` | `./models` | Dossier des artefacts entraînés (partagé). |
| `MODEL_A_VERSION` | `latest` | Version du modèle de scoring à charger. |
| `MODEL_B_VERSION` | `latest` | Version du modèle NLP à charger. |
| `HF_MODEL_NAME` | `Davlan/afro-xlmr-base` | Modèle de base Hugging Face (exemple). |
| `PREDICT_THRESHOLD` | `0.5` | Seuil de décision (réglable sans réentraîner). |
| `SCRAPER_USER_AGENT` | `KWISMO-DataCollector/1.0` | Identifiant envoyé aux sources scrapées. |
| `SCRAPER_DELAY_SECONDS` | `3.0` | Pause minimale entre deux requêtes/actions. |
| `SCRAPER_MAX_CONCURRENCY` | `2` | Requêtes simultanées max (sources texte). |
| `FACEBOOK_USERNAME` / `FACEBOOK_PASSWORD` | *(vide)* | Compte **d'entreprise** dédié — jamais personnel. |
| `INSTAGRAM_USERNAME` / `INSTAGRAM_PASSWORD` | *(vide)* | Idem, compte d'entreprise. |
| `X_USERNAME` / `X_PASSWORD` | *(vide)* | Idem, compte d'entreprise. |

> Copie toujours `.env.example` → `.env` et ne committe jamais `.env`.

---

## 14. Collecte de données (scraping) & entraînement sur Google Colab

### Pourquoi le scraping

Au démarrage du projet, les sources de données prévues (signalements KWISMO, collecte terrain…) sont vides — il n'y a pas encore d'utilisateurs. Le scraping amorce le Modèle B avec des exemples locaux réels le temps que ces sources se remplissent.

### Sources

| Priorité | Sources | Texte natif ? |
| -------- | ------- | -------------- |
| 1 | Orange Cameroun, MTN Cameroun, CIRT Cameroun, MINPOSTEL, 237online, StopBlaBlaCam, PesaCheck | Oui — le message d'arnaque est cité dans l'article, pas d'OCR. |
| 2 | Facebook, Instagram, X (mots-clés : « arnaque mobile money cameroun », « arnaque orange money »…) | Majoritairement des **captures d'écran** → OCR nécessaire. |

Facebook/Instagram/X exigent une connexion : `scrape_social.py` utilise un **compte d'entreprise** dédié (jamais personnel), identifiants dans `.env`. Le scraping de ces plateformes se fait sous couverture de l'entreprise, qui porte la responsabilité en cas de contestation.

### Pipeline

```bash
python -m src.data.scrape           # sources texte
python -m src.data.scrape_social    # Facebook/Instagram/X (Playwright)
python -m src.data.ocr              # OCRise les captures collectées
```

- **Anti-doublon** (`src/data/dedupe.py`) : hash SHA-256 du texte + hash perceptuel des images, état persistant en SQLite (`data/interim/scraping_state.db`) — un second passage ne retraite jamais le déjà-vu.
- **Anti-blocage** : `robots.txt` respecté sur les sources texte, cadence limitée et pauses aléatoires partout. Aucun contournement actif (pas de résolution de CAPTCHA, pas de comptes jetables) — un compte bloqué est un risque accepté, pas un problème à contourner techniquement.
- **Sortie** : `data/raw/scraped/messages.jsonl`, **sans étiquette** arnaque/légitime — l'annotation reste le travail de Data 2 (cahier IA, organisation §11).

### Données sur Git

`data/raw/scraped/messages.jsonl` est **versionné** (texte léger, `git pull` suffit pour que tout le monde — y compris Colab — ait le même jeu de données). Les captures brutes (`data/raw/scraped/images/`) ne le sont **pas** (bloat du dépôt) : à synchroniser sur un dossier Drive partagé de l'équipe à la place.

### Entraînement sur Google Colab

Guide complet, pas-à-pas, gratuit et payant : **[COLAB.md](./COLAB.md)**.
