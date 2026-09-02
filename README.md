# KWISMO

## Plateforme intelligente de protection contre la fraude Mobile Money

**Bleu `#2D2E83` · Orange `#F39200` · Vert `#2FAC66`**

[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Prisma-2FAC66)](./kwismo-backend)
[![Web](https://img.shields.io/badge/Web-React%20%2B%20Vite-2D2E83)](./kwismo-web)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native%20%2B%20Expo-F39200)](./kwismo-mobile)
[![IA](https://img.shields.io/badge/IA-Python%20%2B%20FastAPI-5B5CD6)](./kwismo-ai)
[![License](https://img.shields.io/badge/License-Propriétaire-lightgrey)](#13-licence)

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Le problème résolu](#2-le-problème-résolu)
3. [Architecture globale](#3-architecture-globale)
4. [Structure du monorepo](#4-structure-du-monorepo)
5. [Prérequis](#5-prérequis)
6. [Démarrage rapide (tout le projet)](#6-démarrage-rapide-tout-le-projet)
7. [Démarrage détaillé par partie](#7-démarrage-détaillé-par-partie)
8. [Assurance Qualité & Automatisation CI/CD (GitHub Actions)](#8-assurance-qualité--automatisation-cicd-github-actions)
9. [Variables d'environnement](#8-variables-denvironnement)
10. [Conventions de développement](#9-conventions-de-développement)
11. [Workflow Git](#10-workflow-git)
12. [Équipe & rôles](#11-équipe--rôles)
13. [Planning](#12-planning)
14. [Licence](#13-licence)

---

## 1. Présentation

**KWISMO** est une plateforme propulsée par l'intelligence artificielle qui protège les utilisateurs de Mobile Money (MTN MoMo, Orange Money, Airtel Money, M-Pesa) contre :

- les **appels frauduleux** et faux agents de service client (vishing) ;
- les **tentatives de phishing** et l'ingénierie sociale ;
- les **comptes WhatsApp compromis** ;
- les **transferts vers des numéros corrompus**.

La solution transforme chaque signalement en **intelligence collective** : elle alerte les utilisateurs avant qu'ils ne deviennent victimes, et fournit aux opérateurs télécoms et institutions financières des informations stratégiques pour détecter les campagnes de fraude.

Ce dépôt est un **monorepo** qui regroupe les quatre briques du produit dans des sous-dossiers indépendants mais orchestrés ensemble.

| Brique | Dossier | Stack | Description |
| ------ | ------- | ----- | ----------- |
| **Backend** | [`kwismo-backend/`](./kwismo-backend) | Python · FastAPI · Prisma | API centrale, seule porte vers la base de données. |
| **Web** | [`kwismo-web/`](./kwismo-web) | React · Vite · Tailwind | Landing page + espaces Admin & Partenaire. |
| **Mobile** | [`kwismo-mobile/`](./kwismo-mobile) | React Native · Expo | Application iOS & Android pour les utilisateurs. |
| **Modèle IA** | [`kwismo-ai/`](./kwismo-ai) | Python · scikit-learn · Hugging Face | Service de détection de fraude (scoring + NLP). |

---

## 2. Le problème résolu

La fraude Mobile Money représente une source de pertes financières croissante en Afrique subsaharienne. Les fraudeurs exploitent une littératie numérique inégale et des mécanismes d'authentification basiques.

**Comparatif concurrentiel :**

| Fonctionnalité | Truecaller | Whoscall | **KWISMO** |
| -------------- | ---------- | -------- | ---------- |
| Analyse des numéros | ✅ | ✅ | ✅ |
| Protection des transferts | ❌ | ❌ | ✅ |
| Signalement de numéros | ✅ | ✅ | ✅ |
| Adaptation à tous les réseaux | ❌ | ❌ | ✅ |
| Signalement WhatsApp | ❌ | ❌ | ✅ |
| Disponibilité grand public | ❌ | ❌ | ✅ |

---

## 3. Architecture globale

```text
                          ┌──────────────────────┐
                          │   Application Web    │
                          │  (React + Vite)      │
                          │ Landing / Admin /    │
                          │     Partenaire       │
                          └──────────┬───────────┘
                                     │  HTTPS / REST
                                     │
      ┌────────────────────┐         ▼            ┌─────────────────────┐
      │  Application       │    ┌──────────┐      │   Service IA        │
      │  Mobile            │──▶ │          │────▶│  (FastAPI)          │
      │  (React Native)    │    │ BACKEND  │      │  Modèle A : scoring │
      │                    │◀── │ FastAPI  │◀────│  Modèle B : NLP     │
      └────────────────────┘    │ + Prisma │      └─────────────────────┘
                                └────┬─────┘
                                     │ Prisma
                                     ▼
                          ┌─────────────────────┐
                          │   Base de données   │
                          │ SQLite (dev) →      │
                          │ PostgreSQL (prod)   │
                          └─────────────────────┘
```

**Règles d'architecture non négociables :**

1. **Le backend est l'unique porte vers la base de données.** Ni le web, ni le mobile, ni l'IA n'y accèdent directement.
2. **Le service IA ne se connecte jamais à la base.** Il reçoit ses données via le backend et lui renvoie ses prédictions.
3. **Le contrat d'API entre backend et IA est partagé** (schémas communs) pour éviter toute incompatibilité de format.
4. **Un modèle entraîné est immédiatement exploitable** par le backend via le dossier d'artefacts partagé.

---

## 4. Structure du monorepo

```text
kwismo/
├─ .github/
│  └─ workflows/              # Automation CI/CD GitHub Actions (Backend, IA, Web)
├─ kwismo-backend/            # API centrale (Python / FastAPI / Prisma)
├─ kwismo-web/                # Site web (React / Vite / Tailwind)
├─ kwismo-mobile/             # Application mobile (React Native / Expo)
├─ kwismo-ai/                 # Service IA (Python / scikit-learn / HF)
├─ shared/                    # Ressources partagées entre les parties
│  ├─ api-contract/           # Schéma OpenAPI exporté + types générés
│  │  ├─ openapi.json         # Spécification exportée du backend
│  │  └─ ai-contract.md       # Contrat d'échange backend ↔ IA
│  └─ assets/                 # Logo, palette, polices (source de marque)
│     ├─ logo/
│     │  ├─ logo-horizontal.png
│     │  ├─ logo-vertical.png
│     │  └─ app-icon.png
│     └─ brand.md             # Codes couleurs, typographies officielles
├─ branding/                  # Éléments d'identité visuelle et charte graphique
├─ cadrage/                   # Documents de cadrage stratégique et fonctionnel
├─ cahiers des charges/       # Spécifications détaillées du projet
├─ diagrammes/                # Diagrammes d'architecture, de séquence et de flux
├─ docs/                      # Documentation projet, cahiers des charges (Word) & planning
│  ├─ cahier-web.docx
│  ├─ cahier-mobile.docx
│  ├─ cahier-backend.docx
│  ├─ cahier-ia.docx
│  └─ planification.docx
├─ maquettes/                 # Maquettes UI/UX des interfaces web et mobile
├─ marketing/                 # Supports et ressources de communication
├─ reunions/                  # Comptes rendus et comptes d'équipe
├─ docker-compose.yml         # ★ Orchestration : backend + BD + IA
├─ render.yaml                # ★ Configuration de déploiement Render
├─ .gitignore
├─ .editorconfig              # Style de code commun (indentation, fins de ligne)
├─ .env.example               # Variables globales d'exemple
└─ README.md                  # Ce fichier (documentation principale du monorepo)
```

> **Note** : chaque sous-dossier possède son propre `README.md` détaillé et sa propre configuration. Le présent fichier décrit l'ensemble.

---

## 5. Prérequis

Installe les outils suivants avant de démarrer :

| Outil | Version minimale | Utilisé par |
| ----- | ---------------- | ----------- |
| **Git** | 2.30+ | Tous |
| **Docker** + **Docker Compose** | 24+ | Orchestration globale |
| **Python** | 3.11+ | Backend, IA |
| **Node.js** | 20 LTS+ | Web, Mobile |
| **npm** ou **pnpm** | npm 10+ / pnpm 9+ | Web, Mobile |
| **Expo CLI** | dernière | Mobile |

Vérifie tes versions :

```bash
git --version
docker --version && docker compose version
python --version
node --version && npm --version
```

---

## 6. Démarrage rapide (tout le projet)

La façon la plus simple de tout lancer (backend + base de données + service IA) est **Docker Compose** :

```bash
# 1. Cloner le dépôt
git clone https://github.com/<organisation>/kwismo.git
cd kwismo

# 2. Copier les variables d'environnement d'exemple
cp .env.example .env

# 3. Lancer backend + base + IA en une commande
docker compose up --build
```

Services démarrés :

| Service | URL locale |
| ------- | ---------- |
| API Backend | [API Backend](http://localhost:8000) |
| Documentation Swagger | [Documentation Swagger](http://localhost:8000/docs) |
| Service IA | [Service AI](http://localhost:8001) |
| Base de données | interne (non exposée) |

Le **web** et le **mobile** se lancent séparément (voir §7) car ce sont des interfaces de développement.

```bash
# Arrêter
docker compose down

# Arrêter et supprimer les volumes (réinitialise la base)
docker compose down -v
```

---

## 7. Démarrage détaillé par partie

Chaque partie a son propre README avec tous les détails. Résumé des commandes de démarrage :

### Backend

```bash
cd kwismo-backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
prisma generate && prisma migrate dev                # génère le client + la base
uvicorn app.main:app --reload                        # http://localhost:8000
```

➡ Détails : [`kwismo-backend/README.md`](./kwismo-backend/README.md)

### Web

```bash
cd kwismo-web
npm install
cp .env.example .env
npm run dev                                          # http://localhost:5173
```

➡ Détails : [`kwismo-web/README.md`](./kwismo-web/README.md)

### Mobile

```bash
cd kwismo-mobile
npm install
cp .env.example .env
npx expo start                                       # QR code Expo Go
```

➡ Détails : [`kwismo-mobile/README.md`](./kwismo-mobile/README.md)

### Modèle IA

```bash
cd kwismo-ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.api.main:app --reload --port 8001        # http://localhost:8001
```

➡ Détails : [`kwismo-ai/README.md`](./kwismo-ai/README.md)

---

## 8. Assurance Qualité & Automatisation CI/CD (GitHub Actions)

La qualité du code, la sécurité et l'absence de régression sont assurées automatiquement à chaque `push` ou `pull_request` via **GitHub Actions** (`.github/workflows/`) :

| Pipeline | Fichier Workflow | Validation & Couverture de Tests |
| :--- | :--- | :--- |
| **Backend CI** | [`.github/workflows/backend-ci.yml`](./.github/workflows/backend-ci.yml) | 32 tests Pytest, Audit d'intégration 56 routes (`scripts/test_all_routes.py`), Audit Sécurité SAST Bandit & Safety, Loadtest probe, SonarQube |
| **AI Service CI** | [`.github/workflows/ai-ci.yml`](./.github/workflows/ai-ci.yml) | 52 scénarios de détection de fraude (Camfranglais/Pidgin), Audit d'inférence, SAST Bandit |
| **Frontend Web CI** | [`.github/workflows/web-ci.yml`](./.github/workflows/web-ci.yml) | TypeScript type-check (`tsc --noEmit`), audit vulnérabilités npm, Vite Build |

➡ Pour plus de détails sur la configuration des workflows et de SonarQube, consultez le [**README des Workflows CI/CD**](./.github/workflows/README.md).

---

## 9. Variables d'environnement

Chaque partie possède son fichier `.env.example` à copier en `.env`. Variables globales principales :

| Variable | Exemple | Utilisée par |
| -------- | ------- | ------------ |
| `DATABASE_URL` | `file:./dev.db` (SQLite) | Backend |
| `JWT_SECRET` | *(chaîne aléatoire)* | Backend |
| `AI_SERVICE_URL` | `http://localhost:8001` | Backend |
| `BACKEND_URL` | `http://localhost:8000` | IA, Web, Mobile |
| `VITE_API_URL` | `http://localhost:8000` | Web |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8000` | Mobile |

> ⚠️ **Ne jamais committer de fichier `.env` réel.** Seuls les `.env.example` sont versionnés.

---

## 10. Conventions de développement

| Aspect | Convention |
| ------ | ---------- |
| **Langue du code** | Anglais pour le code (variables, fonctions) ; français pour les textes utilisateur (via i18n). |
| **Textes utilisateur** | Toujours via les fichiers de traduction FR/EN, jamais en dur. |
| **Formatage** | Python : Black + Ruff. JS/TS : Prettier + ESLint. |
| **Couleurs** | Toujours via les design tokens, jamais de couleur codée en dur. |
| **Sécurité** | Aucun secret dans le code ; validation stricte des entrées. |
| **Icônes** | Lucide uniquement — **aucune emoji** dans les interfaces. |

---

## 11. Workflow Git

```bash
# Créer une branche par tâche (référence la clé Jira)
git checkout -b feat/BACK-3-users-crud

# Committer avec un message clair
git commit -m "feat(users): CRUD utilisateurs + KPI perso (BACK-3)"

# Pousser et ouvrir une Pull Request
git push origin feat/BACK-3-users-crud
```

**Convention de nommage des branches** : `type/CLE-JIRA-description`
(types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`)

**Convention de commits** (Conventional Commits) : `type(scope): description (CLE-JIRA)`

---

## 12. Équipe & rôles

| Rôle | Responsabilité |
| ---- | -------------- |
| **Designer** | Design system, maquette Figma, branding, réseaux sociaux, marketing. |
| **Dev Backend** | API FastAPI, base Prisma, sécurité, passerelle IA. |
| **Dev Frontend** | Site web (landing + espaces Admin/Partenaire). |
| **Dev Mobile** | Application React Native (Expo). |
| **Data 1** | Modèle A (scoring de numéros), pipeline de données. |
| **Data 2** | Modèle B (NLP africain), collecte & annotation. |

---

## 13. Planning

Le projet se déroule sur ~3 mois avec des sprints hebdomadaires (lundi → vendredi), à partir du **lundi 20 juillet 2026** :

| Phase | Sprints | Période |
| ----- | ------- | ------- |
| Conception & Maquette | S1 | 20 – 24 juil. |
| Développement | S2 – S4 | 27 juil. – 14 août |
| Déploiement & Lancement V1 | S5 | 17 – 21 août |
| Maintenance & Acquisition | S6 – S8 | 24 août – 11 sept. |
| Préparation présentation | S9 | 14 – 18 sept. |

➡ Détails complets : [`docs/planification.docx`](./docs/planification.docx)

---

## 14. Licence

Projet **propriétaire** — © 2026 Équipe KWISMO. Tous droits réservés.
Toute reproduction ou distribution sans autorisation est interdite.

---

**KWISMO** — *L'infrastructure africaine de référence contre la fraude Mobile Money.*
