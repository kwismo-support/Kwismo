# KWISMO — Backend

## API centrale hybride · FastAPI · Prisma · Sécurité renforcée

[![Python](https://img.shields.io/badge/Python-3.11+-2FAC66)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-2D2E83)](https://fastapi.tiangolo.com)
[![Prisma](<https://img.shields.io/badge/Prisma-Client%20Python-F39200>)](https://prisma-client-py.readthedocs.io)

---

## Table des matières

1. [Description](#1-description)
2. [Stack technique](#2-stack-technique)
3. [Prérequis](#3-prérequis)
4. [Installation &amp; démarrage](#4-installation--démarrage)
5. [Commandes utiles](#5-commandes-utiles)
6. [Structure complète des dossiers et fichiers](#6-structure-complète-des-dossiers-et-fichiers)
7. [Rôle de chaque dossier](#7-rôle-de-chaque-dossier)
8. [Base de données (Prisma)](#8-base-de-données-prisma)
9. [Modules &amp; routes API](#9-modules--routes-api)
10. [Sécurité](#10-sécurité)
11. [Internationalisation](#11-internationalisation)
12. [Communication avec le service IA](#12-communication-avec-le-service-ia)
13. [Tests](#13-tests)
14. [Variables d&#39;environnement](#14-variables-denvironnement)

---

## 1. Description

Le backend est le **cœur de KWISMO** et la **seule porte d'accès à la base de données**. Il :

- expose une **API REST** documentée automatiquement (Swagger/OpenAPI), consommée par le web et le mobile ;
- applique l'**authentification**, les **droits d'accès** (RBAC), la **validation** et la **journalisation** ;
- sert de **passerelle vers le service IA** (transmet les données, récupère les scores) ;
- sert les textes (notifications, alertes, erreurs) en **français et anglais**.

Il est **hybride** : le même code fonctionne sur SQLite (défaut), PostgreSQL ou MySQL grâce à Prisma, sans réécriture.

---

## 2. Stack technique

| Domaine          | Technologie                              |
| ---------------- | ---------------------------------------- |
| Langage          | Python 3.11+                             |
| Framework API    | FastAPI                                  |
| Serveur ASGI     | Uvicorn (+ Gunicorn en prod)             |
| ORM              | Prisma Client Python                     |
| Validation       | Pydantic v2                              |
| Authentification | JWT (python-jose) + Argon2 (argon2-cffi) |
| Documentation    | Swagger UI + ReDoc (auto-générés)     |
| Cache / files    | Redis (optionnel)                        |
| Tests            | pytest + httpx                           |
| Qualité         | Ruff + Black + mypy                      |
| Conteneurisation | Docker + docker-compose                  |

---

## 3. Prérequis

```bash
python --version    # 3.13 (obligatoire)
node --version      # 20+ (nécessaire pour le CLI Prisma)
docker --version    # optionnel mais recommandé
```

> Prisma Client Python s'appuie sur le moteur Prisma (installé automatiquement via pip).

---

## 4. Installation & démarrage

```bash
# 1. Se placer dans le dossier
cd kwismo-backend

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
#   → éditer .env : DB_TYPE, DATABASE_URL, JWT_SECRET, AI_SERVICE_URL…

# 6. Générer le client Prisma et créer la base
prisma generate
prisma migrate dev --name init

# 7. (Optionnel) Peupler la base avec des données de test
python scripts/seed.py

# 8. Lancer le serveur de développement
uvicorn app.main:app --reload
```

L'API tourne sur **[API](http://localhost:8000)** — documentation sur **[API Docs](http://localhost:8000/docs)**.

> **Python 3.13 imposé, à trois niveaux.** `check_python.bat` (ou `scripts/check_python_version.py`) vérifie *avant* la création du venv. `pip install -e .` s'appuie sur `requires-python` (pyproject.toml) pour que pip lui-même refuse d'installer sur la mauvaise version. `app/__init__.py` vérifie *à l'exécution* : toute méthode qui importe le package `app` (`uvicorn`, `gunicorn`, `pytest`, `python scripts/seed.py`…) échoue immédiatement avec un message clair si Python 3.13 n'est pas utilisé. Seul `pip install -r requirements.txt` pris isolément n'a pas de garde-fou natif — pip n'exécute aucune vérification sur un simple fichier de dépendances, d'où les deux autres niveaux.

### Avec Docker (depuis la racine du monorepo)

```bash
docker compose up --build backend
```

---

## 5. Commandes utiles

| Commande                                                   | Effet                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| `uvicorn app.main:app --reload`                          | Démarre l'API en mode développement (rechargement auto).   |
| `prisma generate`                                        | Régénère le client Prisma après modification du schéma. |
| `prisma migrate dev --name <nom>`                        | Crée et applique une migration.                             |
| `prisma studio`                                          | Ouvre une interface visuelle de la base.                     |
| `python scripts/seed.py`                                 | Insère des données de test.                                |
| `pytest`                                                 | Lance la suite de tests.                                     |
| `ruff check . && black . && mypy app`                    | Vérifie la qualité du code.                                |
| `gunicorn app.main:app -k uvicorn.workers.UvicornWorker` | Démarre en mode production.                                 |

---

## 6. Structure complète des dossiers et fichiers

```text
kwismo-backend/
│
├─ app/
│  ├─ __init__.py                    # Signale une erreur si mauvaise version de Python
│  ├─ main.py                        # Point d'entrée FastAPI : app, montage routes, middlewares
│  │
│  ├─ core/                          # Cœur transverse (partagé par tous les modules)
│  │  ├─ __init__.py
│  │  ├─ audit_log.py                # Logging d'audit et AuditLogMiddleware
│  │  ├─ cache.py                    # Gestion du cache Redis et helpers d'invalidation
│  │  ├─ config.py                   # Settings Pydantic (lecture des variables .env, SMTP, Twilio)
│  │  ├─ exceptions.py               # ★ not_implemented() + gestionnaires globaux (anti-crash)
│  │  ├─ i18n.py                     # Chargement des traductions, résolution de la langue
│  │  ├─ lang.py                     # Dépendance d'extraction de la langue (Accept-Language)
│  │  ├─ logging.py                  # Configuration des logs structurés (JSON)
│  │  ├─ middleware.py               # ★ En-têtes de sécurité HTTP + limite de taille de requête
│  │  ├─ permissions.py              # RBAC : require_roles("admin", "partner", "user")
│  │  ├─ rate_limit.py               # ★ slowapi : limite globale + AUTH/OTP_RATE_LIMIT (anti brute-force)
│  │  ├─ schemas.py                  # Page[T], ErrorResponse, Message, HealthOut (bilingues)
│  │  ├─ security.py                 # Hachage Argon2, génération et validation des tokens JWT
│  │  └─ token_store.py              # Gestion et révocation des tokens (blacklist Redis/mémoire)
│  │
│  ├─ db/
│  │  ├─ __init__.py
│  │  ├─ prisma_client.py            # ★ Instance Prisma unique + connect/disconnect (lifespan)
│  │  └─ repositories/               # Accès données par entité (fine abstraction sur Prisma)
│  │     ├─ __init__.py
│  │     ├─ base_repository.py       # ★ CRUD générique portable (jamais de SQL brut)
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
│  │  │  ├─ router.py                # ★ 9 routes /auth/* (register, login, otp, refresh, reset)
│  │  │  ├─ schemas.py               # RegisterIn, LoginIn, TokenOut, DeviceVerificationRequiredOut…
│  │  │  ├─ service.py               # Logique : login, génération/vérif OTP, refresh, reset
│  │  │  └─ dependencies.py          # Dépendances spécifiques à l'auth
│  │  │
│  │  ├─ users/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 5 routes : /users/me, /users, /users/{id}…
│  │  │  ├─ schemas.py               # UserMeOut, UserListItemOut, UserDetailOut, UserStatusIn…
│  │  │  └─ service.py
│  │  │
│  │  ├─ user_phones/                # ★ "Mes numéros" — module distinct de users
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 6 routes /users/me/phones/* (ajout, OTP SMS, compromission)
│  │  │  └─ schemas.py               # UserPhoneOut, UserPhoneAddIn, CompromiseIncidentOut…
│  │  │
│  │  ├─ contacts/                   # Carnet de contacts à insignes
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 4 routes /contacts/* (liste à insignes)
│  │  │  ├─ schemas.py               # ContactOut, ContactAddIn
│  │  │  └─ service.py               # Gestion du carnet de contacts
│  │  │
│  │  ├─ devices/                    # Appareils connectés
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 1 route GET /devices
│  │  │  ├─ schemas.py               # DeviceOut
│  │  │  └─ service.py               # Gestion et déconnexion des appareils
│  │  │
│  │  ├─ numbers/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 5 routes /numbers/verify, /batch-verify, /numbers…
│  │  │  ├─ schemas.py               # NumberVerifyIn, NumberOut, NumberDetailOut, NumberStatusIn…
│  │  │  └─ service.py               # Appelle ai_gateway pour le score
│  │  │
│  │  ├─ reports/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 3 routes /reports (POST, GET, validate)
│  │  │  ├─ schemas.py               # ReportCreateIn, ReportOut, ReportValidateIn
│  │  │  └─ service.py
│  │  │
│  │  ├─ transactions/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 3 routes /transactions/prepare (génère le code USSD), historique
│  │  │  ├─ schemas.py               # TransactionPrepareIn, TransactionOut
│  │  │  └─ service.py
│  │  │
│  │  ├─ ussd/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 12 routes /countries, /operators, /ussd-actions (CRUD admin)
│  │  │  ├─ schemas.py               # CountryOut, OperatorOut, OperatorPrefixOut, UssdActionOut…
│  │  │  └─ service.py               # Génération du format USSD (pays+opérateur+action)
│  │  │
│  │  ├─ partners/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 8 routes /partners, /affiliation-rules, /partner/scope/*
│  │  │  ├─ schemas.py               # PartnerOut, AffiliationRuleOut, PartnerScopeNumberOut…
│  │  │  ├─ service.py               # Cloisonnement par périmètre + règles d'affiliation
│  │  │  └─ affiliation.py           # Logique d'affiliation par préfixes (69, 651-654, 68…)
│  │  │
│  │  ├─ whatsapp_alert/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 2 routes /whatsapp-alerts/incident, /broadcast
│  │  │  ├─ schemas.py               # WhatsAppIncidentIn, WhatsAppBroadcastIn, WhatsAppAlertOut
│  │  │  └─ service.py
│  │  │
│  │  ├─ surveys/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 2 routes /surveys/active, /surveys/{id}/answer
│  │  │  ├─ schemas.py               # SurveyOut, SurveyAnswerIn, SurveyResponseOut
│  │  │  └─ service.py
│  │  │
│  │  ├─ kpi/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 2 routes /kpi/global, /kpi/partner
│  │  │  ├─ schemas.py               # KpiOut
│  │  │  └─ service.py               # Agrégations et calculs d'indicateurs
│  │  │
│  │  ├─ access_control/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 4 routes GET/POST /roles, /access-rights
│  │  │  ├─ schemas.py               # RoleOut, RoleIn, AccessRightOut, AccessRightIn
│  │  │  └─ service.py
│  │  │
│  │  ├─ notifications/
│  │  │  ├─ __init__.py
│  │  │  ├─ router.py                # ★ 1 route GET /notifications
│  │  │  ├─ schemas.py               # NotificationOut
│  │  │  └─ service.py               # Construit les messages FR/EN
│  │  │
│  │  └─ ai_gateway/                 # ★ Passerelle unique vers le service IA
│  │     ├─ __init__.py
│  │     ├─ client.py                # Appels HTTP vers l'IA (/predict, /feedback) + timeout
│  │     ├─ schemas.py               # ★ Contrat d'API PARTAGÉ, identique à kwismo-ai/src/api/schemas.py
│  │     ├─ fallback_rules.py        # Règles expertes de repli si l'IA est indisponible
│  │     ├─ queue.py                 # Envoi asynchrone des signalements (apprentissage continu)
│  │     ├─ service.py               # ★ Modération et gestion des catégories d'arnaques
│  │     └─ router.py                # ★ 2 routes /admin/scam-categories (GET, PATCH)
│  │
│  ├─ locales/                       # Traductions servies par le backend
│  │  ├─ fr.json                     # errors.*, notifications.*, emails.*
│  │  └─ en.json
│  │
│  └─ utils/
│     ├─ __init__.py
│     ├─ crypto.py                   # Chiffrement/déchiffrement de champs sensibles Fernet
│     ├─ dates.py                    # Helpers de dates UTC et d'expiration
│     ├─ email.py                    # ★ Envoi d'emails avec chaîne de secours : Resend -> Google SMTP -> Console
│     ├─ feedback.py                 # File d'attente d'apprentissage continu des signalements
│     ├─ i18n.py                     # Dictionnaire de clés et messages bilingues
│     ├─ otp.py                      # ★ Centralisation unique OTP (SMS Twilio -> Email Resend -> Google SMTP -> Console)
│     ├─ pagination.py               # Helpers de pagination
│     └─ phone.py                    # Normalisation E.164 et validation des numéros
│
├─ prisma/
│  ├─ schema.prisma                  # ★ Schéma unique = toutes les tables/collections
│  ├─ migrations/                    # Historique versionné des migrations
│  │  └─ ...._init/                  # Migration initiale
│  └─ seed_data/                     # Jeux de données initiales (pays, opérateurs, USSD)
│     ├─ countries.json
│     ├─ operators.json
│     └─ ussd_actions.json
│
├─ tests/
│  ├─ __init__.py
│  ├─ conftest.py                    # Fixtures pytest (client de test FastAPI)
│  ├─ test_ai_gateway.py             # Tests du module ai_gateway (schémas et contrats)
│  ├─ test_auth.py                   # Tests d'authentification et inscription
│  ├─ test_devices.py                # Tests du module devices
│  ├─ test_numbers.py                # Tests de vérification de numéros
│  ├─ test_otp.py                    # Tests de génération et envoi OTP
│  ├─ test_partners.py               # Tests du module partenaires
│  ├─ test_reports.py                # Tests de création et gestion des signalements
│  ├─ test_user_phones.py            # Tests de raccordement des numéros de téléphone
│  ├─ test_users.py                  # Tests du profil utilisateur /users/me
│  └─ test_ussd.py                   # Tests des routes USSD et pays
│
├─ scripts/
│  ├─ seed.py                        # Peuple la base (pays, opérateurs, admin par défaut)
│  ├─ create_admin.py                # Crée un compte administrateur
│  ├─ check_python_version.py        # Vérif Python 3.13 (utilisé par check_python.bat)
│  └─ sync_db_provider.py            # Bascule le provider Prisma selon DB_TYPE (.env)
│
├─ entrypoint.sh                     # ★ Script d'initialisation Docker (auto-config DB, seed & gunicorn)
├─ check_python.bat                  # Vérifie Python 3.13 avant de démarrer
├─ .env                              # Variables réelles (NON versionné)
├─ .env.example                      # Modèle de variables (versionné)
├─ .gitignore
├─ .dockerignore
├─ Dockerfile                        # Image du backend
├─ requirements.txt                  # Dépendances Python (pip install -r requirements.txt)
├─ pyproject.toml                    # requires-python + dependencies (pip install -e .)
└─ README.md                         # Ce fichier
```

---

## 7. Rôle de chaque dossier

| Dossier                     | Rôle                                                        | Point de vigilance                                          |
| --------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| `app/core/`               | Fonctions transverses (sécurité, config, i18n, erreurs).   | Source unique de l'auth ; jamais dupliquée.                |
| `app/db/repositories/`    | Accès aux données via Prisma.                              | Isole le métier de la base ; facilite le changement de BD. |
| `app/modules/`            | Un domaine métier par dossier (router + schemas + service). | Chaque route déclare explicitement le rôle requis.        |
| `app/modules/ai_gateway/` | Unique point de communication avec l'IA.                     | Applique délais + repli par règles.                       |
| `app/locales/`            | Textes FR/EN.                                                | Aucun message utilisateur en dur dans le code.              |
| `prisma/`                 | Modèle de données + migrations.                            | Toute évolution passe par une migration versionnée.       |

**Pattern d'un module** : chaque dossier de `modules/` suit toujours le même triptyque —
`router.py` (présentation/routes) → `service.py` (logique métier) → `schemas.py` (validation Pydantic).
Cette régularité rend le code prévisible et testable.

---

## 8. Base de données (Prisma)

Le schéma unique (`prisma/schema.prisma`) définit toutes les entités : `User`, `Contact`, `Number`, `Report`, `Country`, `Operator`, `UssdAction`, `Partner`, `AffiliationRule`, `Transaction`, `WhatsAppAlert`, `SurveyResponse`, `Kpi`, `Role`, `AccessRight`, `AuditLog`.

### Changer de base de données

Deux variables dans `.env` pilotent la base utilisée : `DB_TYPE` (sqlite | postgresql | mysql) et `DATABASE_URL`. Prisma n'autorise pas de `provider` dynamique dans `schema.prisma` (seule `url` peut venir d'une variable d'environnement) — `scripts/sync_db_provider.py` comble cet écart en réécrivant le `provider` du schéma à partir de `DB_TYPE`.

```bash
# 1. Éditer .env : DB_TYPE + DATABASE_URL
DB_TYPE="postgresql"
DATABASE_URL="postgresql://user:pass@localhost:5432/kwismo"

# 2. Répercuter le changement sur le schéma Prisma + régénérer le client
python scripts/sync_db_provider.py --generate

# 3. Appliquer le schéma sur la nouvelle base
prisma migrate dev --name init
```

| `DB_TYPE`          | `DATABASE_URL`                                 |
| -------------------- | ------------------------------------------------ |
| `sqlite` (défaut) | `file:./dev.db`                                |
| `postgresql`       | `postgresql://user:pass@localhost:5432/kwismo` |
| `mysql`            | `mysql://user:pass@localhost:3306/kwismo`      |

> **Cassandra et MongoDB ne sont pas dans le périmètre.** Cassandra n'est pas supportée par Prisma. MongoDB l'est en théorie, mais son connecteur exige que le champ `@id` de chaque modèle soit mappé sur `_id` (`@map("_id")`) — un changement qui toucherait aussi les colonnes des bases SQL si on le généralisait au schéma unique. Choix assumé : KWISMO reste sur SQLite/PostgreSQL/MySQL.

### 🌿 Initialisation et jeu de données de test (Seed)

Le backend inclut un script d'ensemencement complet (`scripts/seed.py`) qui alimente la base de données avec des jeux de données réalistes couvrant l'intégralité des modules (utilisateurs, rôles, numéros, signalements, transactions, contacts, appareils, catégories d'arnaques, KPIs, etc.) pour pouvoir tester immédiatement toutes les routes API (Swagger `/docs`).

#### Exécuter le seed en local :
```bash
python scripts/seed.py
```

#### Exécuter le seed dans un conteneur Docker :
```bash
docker compose exec backend python scripts/seed.py
```

#### Comptes de test générés par le seed :

| Rôle | Email | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **`user`** | `user@kwismo.com` | `Password123!` | Compte utilisateur standard avec numéro de téléphone raccordé |
| **`partner`** | `partner@kwismo.com` | `Password123!` | Compte partenaire associé à *"KWISMO Partner Test"* |
| **`admin`** | `admin@kwismo.com` | `Password123!` | Compte Administrateur (toutes les permissions d'administration) |

---

## 9. Modules & routes API

Toutes les routes sont documentées dans Swagger (`/docs`). Aperçu :

| Module             | Routes principales                                                                                                                              | Rôle                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| auth (9)           | `/auth/register`, `/auth/email/verify`, `/auth/login`, `/auth/device/verify`, `/auth/refresh`, `/auth/password/*`, `/auth/logout` | public / auth                 |
| users (5)          | `/users/me`, `/users`, `/users/{id}`, `/users/{id}/status`                                                                              | user / admin / partner        |
| user_phones (6)    | `/users/me/phones`, `/users/me/phones/{id}/verify`, `/…/resend`, `/…/compromise`                                                      | user                          |
| contacts (4)       | `/contacts`, `/contacts/{id}/refresh` — *voir note ci-dessous                                                                              | user                          |
| numbers (5)        | `/numbers/verify`, `/numbers/batch-verify`, `/numbers`, `/numbers/{id}/status`                                                          | user / admin / partner        |
| reports (3)        | `/reports`, `/reports/{id}/validate`                                                                                                        | user / admin                  |
| transactions (3)   | `/transactions/prepare`, `/transactions`, `/transactions/{id}`                                                                            | user                          |
| ussd (12)          | `/countries`, `/operators`, `/ussd-actions` (+ CRUD)                                                                                      | user (lecture) / admin (CRUD) |
| partners (8)       | `/partners`, `/partners/{id}/affiliation-rules`, `/partner/scope/*`                                                                       | admin / partner               |
| whatsapp_alert (2) | `/whatsapp-alerts/incident`, `/broadcast`                                                                                                   | user                          |
| surveys (2)        | `/surveys/active`, `/surveys/{id}/answer`                                                                                                   | user                          |
| kpi (2)            | `/kpi/global`, `/kpi/partner`                                                                                                               | admin / partner               |
| access_control (4) | `/roles`, `/access-rights`                                                                                                                  | admin                         |
| notifications (1)  | `/notifications`                                                                                                                              | user                          |

*⁠ ⁠`contacts` a été ajouté pour que la table `Contact` et la "liste de contacts à insignes" soient utilisables par `/whatsapp-alerts/broadcast`. Voir le commentaire en tête de `app/modules/contacts/schemas.py`.

Total : **67 opérations** sur **53 chemins**, 100 % typées en entrée/sortie (voir `/openapi.json`). Toutes répondent `501` tant que la logique métier n'est pas écrite — c'est un squelette Swagger-first volontaire.

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

| Variable                    | Exemple                    | Description                                  |
| --------------------------- | -------------------------- | -------------------------------------------- |
| `DATABASE_URL`            | `file:./dev.db`          | Connexion à la base (change selon la BD).   |
| `JWT_SECRET`              | *(aléatoire long)*      | Clé de signature des JWT.                   |
| `JWT_ACCESS_EXPIRE_MIN`   | `15`                     | Durée de vie du token d'accès.             |
| `JWT_REFRESH_EXPIRE_DAYS` | `7`                      | Durée de vie du token de rafraîchissement. |
| `AI_SERVICE_URL`          | `http://localhost:8001`  | URL du service IA.                           |
| `OTP_EXPIRE_MIN`          | `5`                      | Durée de vie d'un OTP.                      |
| `CORS_ORIGINS`            | `http://localhost:5173`  | Origines autorisées.                        |
| `REDIS_URL`               | `redis://localhost:6379` | Cache / files (optionnel).                   |

> Copie toujours `.env.example` → `.env` et ne committe jamais `.env`.
