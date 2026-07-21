# KWISMO — Backend

## API centrale hybride · FastAPI · Prisma · Sécurité renforcée

[![Python](https://img.shields.io/badge/Python-3.11+-2FAC66)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-2D2E83)](https://fastapi.tiangolo.com)
[![Prisma](https://img.shields.io/badge/Prisma-Client%20Python-F39200)](https://prisma-client-py.readthedocs.io)

---

## Table des matières

1. [Description](#1-description)
2. [Stack technique](#2-stack-technique)
3. [Prérequis](#3-prérequis)
4. [Installation & démarrage](#4-installation--démarrage)
5. [Commandes utiles](#5-commandes-utiles)
6. [Structure complète des dossiers et fichiers](#6-structure-complète-des-dossiers-et-fichiers)
7. [Rôle de chaque dossier](#7-rôle-de-chaque-dossier)
8. [Base de données (Prisma)](#8-base-de-données-prisma)
9. [Modules & routes API](#9-modules--routes-api)
10. [Sécurité](#10-sécurité)
11. [Internationalisation](#11-internationalisation)
12. [Communication avec le service IA](#12-communication-avec-le-service-ia)
13. [Tests](#13-tests)
14. [Variables d'environnement](#14-variables-denvironnement)

---

## 1. Description

Le backend est le **cœur de KWISMO** et la **seule porte d'accès à la base de données**. Il :

- expose une **API REST** documentée automatiquement (Swagger/OpenAPI), consommée par le web et le mobile ;
- applique l'**authentification**, les **droits d'accès** (RBAC), la **validation** et la **journalisation** ;
- sert de **passerelle vers le service IA** (transmet les données, récupère les scores) ;
- sert les textes (notifications, alertes, erreurs) en **français et anglais**.

Il est **hybride** : le même code fonctionne sur SQLite (défaut), PostgreSQL, MySQL ou MongoDB grâce à Prisma, sans réécriture.

---

## 2. Stack technique

| Domaine | Technologie |
| ------- | ----------- |
| Langage | Python 3.11+ |
| Framework API | FastAPI |
| Serveur ASGI | Uvicorn (+ Gunicorn en prod) |
| ORM | Prisma Client Python |
| Validation | Pydantic v2 |
| Authentification | JWT (python-jose) + Argon2 (argon2-cffi) |
| Documentation | Swagger UI + ReDoc (auto-générés) |
| Cache / files | Redis (optionnel) |
| Tests | pytest + httpx |
| Qualité | Ruff + Black + mypy |
| Conteneurisation | Docker + docker-compose |

---

## 3. Prérequis

```bash
python --version    # 3.11+
node --version      # 20+ (nécessaire pour le CLI Prisma)
docker --version    # optionnel mais recommandé
```

> Prisma Client Python s'appuie sur le moteur Prisma (installé automatiquement via pip).

---

## 4. Installation & démarrage

```bash
# 1. Se placer dans le dossier
cd kwismo-backend

# 2. Créer et activer un environnement virtuel
python -m venv .venv
source .venv/bin/activate           # Windows : .venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer l'environnement
cp .env.example .env
#   → éditer .env : DATABASE_URL, JWT_SECRET, AI_SERVICE_URL…

# 5. Générer le client Prisma et créer la base
prisma generate
prisma migrate dev --name init

# 6. (Optionnel) Peupler la base avec des données de test
python scripts/seed.py

# 7. Lancer le serveur de développement
uvicorn app.main:app --reload
```

L'API tourne sur **[API](http://localhost:8000)** — documentation sur **[API Docs](http://localhost:8000/docs)**.

### Avec Docker (depuis la racine du monorepo)

```bash
docker compose up --build backend
```

---

## 5. Commandes utiles

| Commande | Effet |
| -------- | ----- |
| `uvicorn app.main:app --reload` | Démarre l'API en mode développement (rechargement auto). |
| `prisma generate` | Régénère le client Prisma après modification du schéma. |
| `prisma migrate dev --name <nom>` | Crée et applique une migration. |
| `prisma studio` | Ouvre une interface visuelle de la base. |
| `python scripts/seed.py` | Insère des données de test. |
| `pytest` | Lance la suite de tests. |
| `ruff check . && black . && mypy app` | Vérifie la qualité du code. |
| `gunicorn app.main:app -k uvicorn.workers.UvicornWorker` | Démarre en mode production. |

---

## 6. Structure complète des dossiers et fichiers

```text
kwismo-backend/
│
├─ app/
│  ├─ __init__.py
│  ├─ main.py                        # Point d'entrée FastAPI : app, montage routes, middlewares
│  │
│  ├─ core/                          # Cœur transverse (partagé par tous les modules)
│  │  ├─ __init__.py
│  │  ├─ config.py                   # Settings Pydantic (lecture des variables .env)
│  │  ├─ security.py                 # JWT (création/vérif), hachage Argon2, get_current_user
│  │  ├─ permissions.py              # RBAC : require_role("admin"), require_role("partner")
│  │  ├─ rate_limit.py               # Limitation de débit (par IP / utilisateur)
│  │  ├─ middleware.py               # Journalisation, en-têtes de sécurité, mesure du temps
│  │  ├─ exceptions.py               # Exceptions métier + gestionnaire d'erreurs global
│  │  ├─ i18n.py                     # Chargement des traductions, résolution de la langue
│  │  └─ logging.py                  # Configuration des logs structurés (JSON)
│  │
│  ├─ db/
│  │  ├─ __init__.py
│  │  ├─ prisma_client.py            # Instance Prisma unique (connexion/déconnexion)
│  │  └─ repositories/               # Accès données par entité (fine abstraction sur Prisma)
│  │     ├─ __init__.py
│  │     ├─ base_repository.py       # CRUD générique réutilisable
│  │     ├─ user_repository.py
│  │     ├─ number_repository.py
│  │     ├─ report_repository.py
│  │     ├─ partner_repository.py
│  │     ├─ transaction_repository.py
│  │     └─ ussd_repository.py
│  │
│  ├─ modules/                       # ★ Un domaine métier = un dossier
│  │  ├─ __init__.py
│  │  │
│  │  ├─ auth/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # Routes /auth/* (register, login, otp, refresh, reset)
│  │  │  ├─ schemas.py               # Pydantic : RegisterIn, LoginIn, TokenOut, OtpVerifyIn…
│  │  │  ├─ service.py               # Logique : login, génération/vérif OTP, refresh, reset
│  │  │  └─ dependencies.py          # Dépendances spécifiques à l'auth
│  │  │
│  │  ├─ users/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /users/me, /users, /users/{id}…
│  │  │  ├─ schemas.py               # UserOut, UserUpdateIn, UserKpiOut…
│  │  │  └─ service.py
│  │  │
│  │  ├─ numbers/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /numbers/verify, /numbers/batch-verify, /numbers…
│  │  │  ├─ schemas.py               # NumberVerifyIn, NumberOut, RiskScoreOut…
│  │  │  └─ service.py               # Appelle ai_gateway pour le score
│  │  │
│  │  ├─ reports/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /reports (POST, GET, validate)
│  │  │  ├─ schemas.py
│  │  │  └─ service.py
│  │  │
│  │  ├─ transactions/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /transactions/prepare (génère le code USSD)
│  │  │  ├─ schemas.py
│  │  │  └─ service.py
│  │  │
│  │  ├─ ussd/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /countries, /operators, /ussd-actions
│  │  │  ├─ schemas.py               # CountryOut, OperatorOut, UssdActionOut…
│  │  │  └─ service.py               # Génération du format USSD (pays+opérateur+action)
│  │  │
│  │  ├─ partners/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /partners, /partners/{id}/affiliation-rules, /partner/scope/*
│  │  │  ├─ schemas.py               # PartnerOut, AffiliationRuleIn…
│  │  │  ├─ service.py               # Cloisonnement par périmètre + règles d'affiliation
│  │  │  └─ affiliation.py           # Logique d'affiliation par préfixes (69, 651-654, 68…)
│  │  │
│  │  ├─ whatsapp_alert/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /whatsapp-alerts/incident, /broadcast
│  │  │  ├─ schemas.py
│  │  │  └─ service.py
│  │  │
│  │  ├─ surveys/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /surveys/active, /surveys/{id}/answer
│  │  │  ├─ schemas.py
│  │  │  └─ service.py
│  │  │
│  │  ├─ kpi/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /kpi/global, /kpi/partner
│  │  │  ├─ schemas.py
│  │  │  └─ service.py               # Agrégations et calculs d'indicateurs
│  │  │
│  │  ├─ access_control/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /roles, /access-rights
│  │  │  ├─ schemas.py
│  │  │  └─ service.py
│  │  │
│  │  ├─ notifications/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # /notifications
│  │  │  ├─ schemas.py
│  │  │  └─ service.py               # Construit les messages FR/EN
│  │  │
│  │  └─ ai_gateway/                 # ★ Passerelle unique vers le service IA
│  │     ├─ __init__.py
│  │     ├─ client.py                # Appels HTTP vers l'IA (/predict, /feedback) + timeout
│  │     ├─ schemas.py               # ★ Contrat d'API PARTAGÉ avec le service IA
│  │     ├─ fallback_rules.py        # Règles expertes de repli si l'IA est indisponible
│  │     └─ queue.py                 # Envoi asynchrone des signalements (apprentissage continu)
│  │
│  ├─ locales/                       # Traductions servies par le backend
│  │  ├─ fr.json                     # errors.*, notifications.*, emails.*
│  │  └─ en.json
│  │
│  └─ utils/
│     ├─ __init__.py
│     ├─ phone.py                    # Normalisation/validation de numéros
│     ├─ pagination.py               # Helpers de pagination
│     ├─ dates.py
│     └─ crypto.py                   # Chiffrement de champs sensibles
│
├─ prisma/
│  ├─ schema.prisma                  # ★ Schéma unique = toutes les tables/collections
│  ├─ migrations/                    # Historique versionné des migrations
│  │  └─ .gitkeep
│  └─ seed_data/                     # Jeux de données initiales (pays, opérateurs, USSD)
│     ├─ countries.json
│     ├─ operators.json
│     └─ ussd_actions.json
│
├─ tests/
│  ├─ __init__.py
│  ├─ conftest.py                    # Fixtures pytest (client de test, base en mémoire)
│  ├─ test_auth.py
│  ├─ test_numbers.py
│  ├─ test_partners.py
│  ├─ test_ussd.py
│  └─ test_ai_gateway.py
│
├─ scripts/
│  ├─ seed.py                        # Peuple la base (pays, opérateurs, admin par défaut)
│  └─ create_admin.py                # Crée un compte administrateur
│
├─ .env                             # Variables réelles (NON versionné)
├─ .env.example                     # Modèle de variables (versionné)
├─ .gitignore
├─ .dockerignore
├─ Dockerfile                        # Image du backend
├─ requirements.txt                 # Dépendances Python
├─ pyproject.toml                    # Config Ruff / Black / mypy / pytest
└─ README.md                         # Ce fichier
```

---

## 7. Rôle de chaque dossier

| Dossier | Rôle | Point de vigilance |
| ------- | ---- | ------------------ |
| `app/core/` | Fonctions transverses (sécurité, config, i18n, erreurs). | Source unique de l'auth ; jamais dupliquée. |
| `app/db/repositories/` | Accès aux données via Prisma. | Isole le métier de la base ; facilite le changement de BD. |
| `app/modules/` | Un domaine métier par dossier (router + schemas + service). | Chaque route déclare explicitement le rôle requis. |
| `app/modules/ai_gateway/` | Unique point de communication avec l'IA. | Applique délais + repli par règles. |
| `app/locales/` | Textes FR/EN. | Aucun message utilisateur en dur dans le code. |
| `prisma/` | Modèle de données + migrations. | Toute évolution passe par une migration versionnée. |

**Pattern d'un module** : chaque dossier de `modules/` suit toujours le même triptyque —
`router.py` (présentation/routes) → `service.py` (logique métier) → `schemas.py` (validation Pydantic).
Cette régularité rend le code prévisible et testable.

---

## 8. Base de données (Prisma)

Le schéma unique (`prisma/schema.prisma`) définit toutes les entités : `User`, `Contact`, `Number`, `Report`, `Country`, `Operator`, `UssdAction`, `Partner`, `AffiliationRule`, `Transaction`, `WhatsAppAlert`, `SurveyResponse`, `Kpi`, `Role`, `AccessRight`, `AuditLog`.

```bash
# Changer de base = changer une seule variable DATABASE_URL :
file:./dev.db                                   # SQLite (défaut)
postgresql://user:pass@localhost:5432/kwismo    # PostgreSQL
mysql://user:pass@localhost:3306/kwismo         # MySQL
mongodb+srv://user:pass@cluster/kwismo          # MongoDB
```

> **Cassandra n'est pas supportée par Prisma** et n'est volontairement pas dans le périmètre.

---

## 9. Modules & routes API

Toutes les routes sont documentées dans Swagger (`/docs`). Aperçu :

| Module | Routes principales | Rôle |
| ------ | ------------------ | ---- |
| auth | `/auth/register`, `/auth/otp/verify`, `/auth/login`, `/auth/refresh`, `/auth/password/*` | public / auth |
| users | `/users/me`, `/users`, `/users/{id}` | user / admin / partner |
| numbers | `/numbers/verify`, `/numbers/batch-verify`, `/numbers` | user / admin / partner |
| reports | `/reports` | user / admin |
| transactions | `/transactions/prepare` | user |
| ussd | `/countries`, `/operators`, `/ussd-actions` | user (lecture) / admin (CRUD) |
| partners | `/partners`, `/partners/{id}/affiliation-rules`, `/partner/scope/*` | admin / partner |
| whatsapp_alert | `/whatsapp-alerts/incident`, `/broadcast` | user |
| surveys | `/surveys/active`, `/surveys/{id}/answer` | user |
| kpi | `/kpi/global`, `/kpi/partner` | admin / partner |
| access_control | `/roles`, `/access-rights` | admin |
| notifications | `/notifications` | user |

---

## 10. Sécurité

- **Authentification** : JWT access (courte durée) + refresh (rotatif, révocable) ; mots de passe hachés Argon2 ; OTP à usage unique.
- **Autorisation** : RBAC (`user` / `partner` / `admin`) ; cloisonnement du périmètre partenaire appliqué **côté serveur**.
- **Données** : HTTPS/TLS, chiffrement des champs sensibles, journal d'audit.
- **Applicatif** : validation Pydantic, protection injections/XSS/CSRF, en-têtes de sécurité, CORS strict.
- **Réseau** : rate-limiting, reverse proxy / WAF, atténuation DDoS, secrets hors du code.

---

## 11. Internationalisation

Les textes utilisateur sont dans `app/locales/fr.json` et `en.json`, organisés par clés hiérarchiques :

```json
{
  "errors": { "invalid_otp": "Code OTP invalide.", "number_invalid": "Numéro invalide pour {country}." },
  "notifications": { "suspicious_call": "Appel suspect détecté de {number}." }
}
```

La langue est déterminée par l'en-tête `Accept-Language` ou la préférence de l'utilisateur (défaut : français).

---

## 12. Communication avec le service IA

- **Synchrone** : `numbers/service.py` → `ai_gateway/client.py` → `POST {AI_SERVICE_URL}/predict/number` → score renvoyé.
- **Asynchrone** : les signalements sont transmis via `ai_gateway/queue.py` → `POST /feedback` (apprentissage continu).
- **Repli** : si l'IA ne répond pas, `ai_gateway/fallback_rules.py` prend le relais → l'utilisateur n'est jamais bloqué.
- **Contrat partagé** : `ai_gateway/schemas.py` doit rester **identique** aux schémas côté IA (`kwismo-ai/src/api/schemas.py`).

---

## 13. Tests

```bash
pytest                      # tous les tests
pytest tests/test_auth.py   # un fichier
pytest -k "verify"          # par mot-clé
pytest --cov=app            # avec couverture
```

Les tests utilisent une base SQLite en mémoire (rapide, isolée) via les fixtures de `conftest.py`.

---

## 14. Variables d'environnement

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `DATABASE_URL` | `file:./dev.db` | Connexion à la base (change selon la BD). |
| `JWT_SECRET` | *(aléatoire long)* | Clé de signature des JWT. |
| `JWT_ACCESS_EXPIRE_MIN` | `15` | Durée de vie du token d'accès. |
| `JWT_REFRESH_EXPIRE_DAYS` | `7` | Durée de vie du token de rafraîchissement. |
| `AI_SERVICE_URL` | `http://localhost:8001` | URL du service IA. |
| `OTP_EXPIRE_MIN` | `5` | Durée de vie d'un OTP. |
| `CORS_ORIGINS` | `http://localhost:5173` | Origines autorisées. |
| `REDIS_URL` | `redis://localhost:6379` | Cache / files (optionnel). |

> Copie toujours `.env.example` → `.env` et ne committe jamais `.env`.
