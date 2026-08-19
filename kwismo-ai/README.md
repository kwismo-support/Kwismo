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
| `python -m src.data.clean` | Nettoie le dataset brut et extrait les cas de fraude → `data/processed/model_b_clean.jsonl`. |
| `python -m src.models.model_a.train` | Entraîne le Modèle A (scoring). |
| `python -m src.models.model_b.train` | Entraîne le Modèle B (NLP & auto-catégorisation). |
| `python -m src.evaluation.metrics` | Évalue les modèles (rappel, précision, F1). |
| `python -m src.data.scrape` | Découvre des sources et scrape texte/image → `data/raw/scraped/`. |
| `python -m src.data.scrape_social` | Scrape Facebook/Instagram/X. |
| `python -m src.data.ocr` | OCRise les captures en attente (`type: "image_a_ocr"`). |
| `python -m src.data.metrics` | Régénère l'historique et les graphes d'évolution de la collecte. |
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
│  │  └─ scraped/                   # ★ Sortie du scraping
│  │     ├─ messages.jsonl          # ★ Versionné : texte + résultat OCR, sans étiquette
│  │     └─ images/                 # Captures brutes — NON versionné, à synchroniser sur Drive
│  ├─ interim/                      # Données nettoyées intermédiaires
│  │  ├─ .gitkeep
│  │  ├─ scraping_state.db          # Registre anti-doublon SQLite — NON versionné
│  │  ├─ known_domains.json         # ★ Domaines découverts par le scraper — versionné
│  │  └─ metrics/                   # ★ Historique + graphes de scraping — versionné
│  └─ processed/                    # Données prêtes pour l'entraînement
│     ├─ model_b_clean.jsonl        # ★ Données nettoyées (504 extraits)
│     ├─ model_b_augmented.jsonl    # ★ Données augmentées synthétiques (1477 extraits)
│     ├─ legit_examples.jsonl       # ★ Exemples de transactions & chats légitimes réels
│     └─ model_a_dataset.csv        # ★ Dataset comportemental & temporel (1000 numéros)
│
├─ notebooks/                       # Exploration & entraînement (local + Colab + Kaggle)
│  ├─ 01_exploration.ipynb          # Analyse exploratoire des données (EDA + 4 graphes)
│  ├─ 02_train_model_a.ipynb        # Entraînement scoring Modèle A (interactive + 4 graphes)
│  ├─ 03_train_model_b.ipynb        # Fine-tuning NLP AfroXLMR & métriques (Colab / Kaggle + 4 graphes)
│  └─ 04_scraping.ipynb             # ★ Collecte + OCR + métriques (appelle src/data/ + 2 graphes)
│
├─ src/                             # ★ Code source réutilisable
│  ├─ __init__.py                   # Signale une erreur si mauvaise version Python
│  ├─ config.py                     # Settings Pydantic : BACKEND_URL, MODEL_DIR, seuils…
│  │
│  ├─ data/
│  │  ├─ __init__.py
│  │  ├─ collect.py                 # Réception des données depuis le backend
│  │  ├─ clean.py                   # Nettoyage et structuration des extraits de fraude
│  │  ├─ augment.py                 # ★ Augmentation synthétique en Franglais/Pidgin
│  │  ├─ generate_model_a_data.py   # ★ Générateur de dataset comportemental & temporel Modèle A
│  │  ├─ slang_dictionary.json      # ★ Dictionnaire évolutif de normalisation camfranglais/pidgin
│  │  ├─ features.py                # Construction des caractéristiques & métriques temporelles (Modèle A)
│  │  ├─ scrape.py                  # ★ Découverte web dynamique + collecte texte/image
│  │  ├─ scrape_social.py           # ★ Scraping Facebook/Instagram/X (Playwright)
│  │  ├─ ocr.py                     # ★ Texte depuis capture d'écran (EasyOCR)
│  │  ├─ dedupe.py                  # ★ Anti-doublon atomique texte + image (SQLite)
│  │  └─ metrics.py                 # ★ Historique + graphes de scraping
│  │
│  ├─ models/
│  │  ├─ __init__.py
│  │  │
│  │  ├─ model_a/                   # Scoring de réputation des numéros (Temporel & Comportemental)
│  │  │  ├─ __init__.py
│  │  │  ├─ train.py                # Entraînement LightGBM & sérialisation joblib
│  │  │  ├─ predict.py              # Inférence score_risque (0.0-1.0) + explications (cap 0.69)
│  │  │  └─ rules.py                # Règles expertes temporelles (démarrage à froid / repli)
│  │  │
│  │  └─ model_b/                   # NLP multilingue (arnaque texte & auto-catégorisation)
│  │     ├─ __init__.py
│  │     ├─ preprocess.py           # Prétraitement franglais/pidgin, NER & skip-cache
│  │     ├─ train.py                # Fine-tuning AfroXLMR (PEFT/LoRA) — Colab/PC/Kaggle
│  │     ├─ predict.py              # Inférence (probabilité d'arnaque + catégorie)
│  │     └─ fallback.py             # Repli TF-IDF + régression logistique
│  │
│  ├─ evaluation/
│  │  ├─ __init__.py
│  │  └─ metrics.py                 # Rappel, précision, F1, matrice de confusion
│  │
│  └─ api/                          # ★ Service d'inférence (FastAPI)
│     ├─ __init__.py
│     ├─ main.py                    # ★ Routes : /predict/number, /predict/text, /predict/full_analysis
│     ├─ schemas.py                 # ★ Contrat d'API PARTAGÉ avec kwismo-backend
│     ├─ errors.py                  # ★ slowapi (anti-surcharge) + gestionnaires d'erreurs
│     ├─ middleware.py              # ★ Limite de taille de requête
│     └─ loader.py                  # ★ Charge les modèles avec Rollback automatique
│
├─ models/                          # ★ Artefacts entraînés (partagés au backend)
│  ├─ model_a/
│  │  ├─ .gitkeep
│  │  └─ model_a_v1.joblib          # ★ Modèle LightGBM entraîné
│  ├─ model_b/
│  │  ├─ .gitkeep
│  │  └─ model_b_fallback_v1.joblib # ★ Modèle NLP TF-IDF de repli
│  └─ registry.json                 # Versions + métriques + historique de rollback
│
├─ tests/
│  ├─ __init__.py
│  ├─ test_features.py
│  ├─ test_model_a.py
│  ├─ test_model_b.py
│  ├─ test_model_b_extended.py      # ★ Suite étendue à 52 scénarios réels
│  └─ test_api.py
│
├─ logs/
│  └─ test_all_routes.log           # Logs d'audit d'exécution des tests d'inférence (succès/échecs)
│
├─ scripts/
│  ├─ check_python_version.py       # Fichier de vérification de Python 3.13
│  └─ test_all_routes.py            # ★ Script d'audit et de test automatisé de TOUTES les routes d'inférence IA
│
├─ entrypoint.sh                    # ★ Script d'initialisation Docker (génération/entraînement auto & uvicorn)
├─ check_python.bat                 # Vérifie Python 3.13 avant de démarrer
├─ .env                             # Variables réelles (NON versionné)
├─ .env.example
├─ .gitignore
├─ .dockerignore
├─ Dockerfile                       # Image du service d'inférence
├─ requirements.txt                 # scikit-learn, lightgbm, transformers, playwright, easyocr, seaborn…
├─ pyproject.toml                   # requires-python + dependencies (pip install -e .)
├─ COLAB.md                         # Guide d'exécution Google Colab
├─ KAGGLE.md                        # ★ Guide d'exécution Kaggle Notebooks
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

### 🚀 Audit et test automatisé de TOUTES les routes IA (`test_all_routes.py`)

Un script autonome d'audit complet est disponible dans `scripts/test_all_routes.py`. Il teste le service d'inférence en cours d'exécution (`uvicorn src.api.main:app --port 8001`) :

- Test de santé et version (`/health`, `/version`).
- Validation du **Modèle A** : scoring temporel et fréquentiel de numéros (`/predict/number`).
- Validation du **Modèle B** : catégorisation NLP multilingue de signalements (`/predict/text`, `/predict/batch_reports`).
- Validation de l'**Orchestrateur Général** : analyse combinée complète (`/predict/full_analysis`).
- Validation de la boucle de feedback (`/feedback`).
- Journalisation structurée dans **`logs/test_all_routes.log`**.

#### Conditions à remplir pour démarrer :
1. Le service IA doit être démarré : `uvicorn src.api.main:app --port 8001` (ou `docker compose up`).
2. Les modèles doivent être chargés (ou entraînés automatiquement via `entrypoint.sh`).

#### Commande d'exécution :
```bash
python scripts/test_all_routes.py
```
Les logs et détails de l'audit sont consultables directement dans : `logs/test_all_routes.log`.

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
| `SCRAPER_MAX_RETRIES` | `3` | Tentatives avant d'abandonner une URL pour ce run (délai croissant). |
| `SCRAPER_PROXY_URL` | *(vide)* | Proxy optionnel, seulement si l'entreprise en possède déjà un. |
| `SCRAPER_SEARCH_REGION` | `fr-fr` | Région de recherche pour la découverte dynamique de sites. |
| `SCRAPER_MAX_RESULTS_PER_KEYWORD` | `10` | Résultats max par mot-clé lors de la découverte. |
| `FACEBOOK_ACCOUNTS` | *(vide)* | Comptes **d'entreprise** dédiés — `"user1:pass1,user2:pass2"`, jamais personnels. |
| `INSTAGRAM_ACCOUNTS` | *(vide)* | Idem, comptes d'entreprise. |
| `X_ACCOUNTS` | *(vide)* | Idem, comptes d'entreprise. |

> Copie toujours `.env.example` → `.env` et ne committe jamais `.env`.

---

## 14. Collecte de données (scraping) & entraînement sur Google Colab

### Pourquoi le scraping

Au démarrage du projet, les sources de données prévues (signalements KWISMO, collecte terrain…) sont vides — il n'y a pas encore d'utilisateurs. Le scraping amorce le Modèle B avec des exemples locaux réels le temps que ces sources se remplissent.

### Sources — découverte dynamique, pas de liste figée

`src/data/scrape.py` n'a pas de liste de sites codée en dur : il interroge un moteur de recherche (`ddgs`, gratuit, sans clé API) avec des mots-clés larges — arnaque, usurpation d'identité, piratage de compte, vidage de compte, vol d'argent mobile money — et découvre lui-même les domaines pertinents, qu'il retient pour les prochaines recherches (`data/interim/known_domains.json`). **Chaque page visitée est vérifiée pour du texte ET des images**, sans présupposer le type de contenu d'un site. Un filtre de pertinence écarte les pages hors-sujet avant de les garder.

Facebook, Instagram, X exigent une connexion pour la quasi-totalité de leur contenu (majoritairement des **captures d'écran** → OCR) : `scrape_social.py` utilise des **comptes d'entreprise** dédiés (jamais personnels), identifiants dans `.env` — plusieurs comptes possibles par plateforme, essayés dans l'ordre. Le scraping de ces plateformes se fait sous couverture de l'entreprise, qui porte la responsabilité en cas de contestation.

### Pipeline

```bash
python -m src.data.scrape           # découverte + collecte texte/image
python -m src.data.scrape_social    # Facebook/Instagram/X (Playwright)
python -m src.data.ocr              # OCRise les captures collectées
python -m src.data.metrics          # régénère les graphes d'évolution
```

- **Anti-doublon** (`src/data/dedupe.py`) : hash SHA-256 du texte + hash perceptuel des images, vérification et marquage **atomiques** (pas de course entre deux pages traitées en parallèle qui partagent une même image). État persistant en SQLite. `reconcile()` revérifie au début de chaque run que ce que la base dit « déjà vu » existe réellement dans `data/` — une suppression accidentelle de fichier ne fait jamais perdre une donnée pour de bon.
- **Résilience réseau** : nouvelle tentative avec délai croissant (2s, 4s, 8s) avant d'abandonner une URL pour ce run ; une coupure de connexion n'oblige jamais à tout recommencer, grâce à l'état persistant.
- **Anti-blocage** : `robots.txt` respecté sur les sources texte, cadence limitée et pauses aléatoires partout, proxy optionnel (`SCRAPER_PROXY_URL`) si l'entreprise en possède déjà un. Aucun contournement actif (pas de résolution de CAPTCHA, pas de bascule automatique de compte en cas de blocage, pas d'usurpation d'empreinte navigateur) — `scrape_social.py` s'arrête et journalise plutôt que de basculer silencieusement, pour qu'un humain décide de la suite.
- **Métriques** (`src/data/metrics.py`) : chaque run enregistre volume/erreurs/durée par source dans un historique (`data/interim/metrics/`), avec des graphes d'évolution — pour savoir si la collecte progresse d'un lancement à l'autre. Fonctionne pareil en notebook ou en script (même code).
- **Sortie** : `data/raw/scraped/messages.jsonl`, **sans étiquette** arnaque/légitime — l'annotation reste le travail de Data 2 (cahier IA, organisation §11).

### Données sur Git

`data/raw/scraped/messages.jsonl` et `data/interim/metrics/` sont **versionnés** (texte léger, `git pull` suffit pour que tout le monde — y compris Colab — ait le même jeu de données et le même historique). Les captures brutes (`data/raw/scraped/images/`) ne le sont **pas** (bloat du dépôt) : à synchroniser sur un dossier Drive partagé de l'équipe à la place.

### Exécuter la collecte (notebook ou script)

`notebooks/04_scraping.ipynb` appelle directement le code de `src/data/` (aucune logique dupliquée) — fonctionne en local comme sur Colab (détection automatique). Sinon, les commandes du pipeline ci-dessus font exactement la même chose en ligne de commande.

### Entraînement sur Google Colab

Guide complet, pas-à-pas, gratuit et payant : **[COLAB.md](./COLAB.md)**.
