# KWISMO — Web

## Landing page & Espaces Admin / Partenaire · React · Vite · TailwindCSS

[![React](https://img.shields.io/badge/React-18-2D2E83)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-F39200)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-2FAC66)](https://tailwindcss.com)

---

## Table des matières

1. [Description](#1-description)
2. [Stack technique](#2-stack-technique)
3. [Prérequis](#3-prérequis)
4. [Installation &amp; démarrage](#4-installation--démarrage)
5. [Commandes utiles](#5-commandes-utiles)
6. [Structure complète des dossiers et fichiers](#6-structure-complète-des-dossiers-et-fichiers)
7. [Rôle de chaque dossier](#7-rôle-de-chaque-dossier)
8. [Design system &amp; thèmes](#8-design-system--thèmes)
9. [Internationalisation](#9-internationalisation)
10. [Données &amp; cache](#10-données--cache)
11. [Sécurité front](#11-sécurité-front)
12. [Variables d&#39;environnement](#12-variables-denvironnement)

---

## 1. Description

Le web KWISMO comprend :

- une **landing page** publique (hero, problème/fraude, comparatif, fonctionnalités, « comment ça marche », partenaires, **tarifs API à 0,001 $/appel**, CTA, footer) ;
- un **espace Admin** (supervision globale : utilisateurs, partenaires, numéros, pays/opérateurs/USSD, droits, KPI) ;
- un **espace Partenaire** (mêmes types de pages, mais cloisonnées au périmètre de l'entreprise).

Caractéristiques : **thème clair/sombre**, **français/anglais**, **responsive 100 %**, accessibilité **WCAG AA**.

---

## 2. Stack technique

| Domaine          | Technologie                      |
| ---------------- | -------------------------------- |
| Build            | Vite                             |
| Framework        | React 18 (JSX/TSX)               |
| Langage          | TypeScript                       |
| Styles           | TailwindCSS                      |
| Composants       | shadcn/ui + Radix UI             |
| Icônes          | lucide-react*(aucune emoji)*     |
| Routing          | React Router v6                  |
| Données serveur | TanStack Query                   |
| État client     | Zustand                          |
| Formulaires      | React Hook Form + Zod            |
| i18n             | i18next + react-i18next          |
| Graphiques       | Recharts                         |
| HTTP             | Axios (instance + intercepteurs) |
| Qualité         | ESLint + Prettier                |
| Tests            | Vitest + Testing Library         |

---

## 3. Prérequis

```bash
node --version    # 20 LTS+
npm --version     # 10+
```

---

## 4. Installation & démarrage

```bash
# 1. Se placer dans le dossier
cd kwismo-web

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
#   → éditer VITE_API_URL (URL du backend)

# 4. Lancer le serveur de développement
npm run dev
```

L'application tourne sur cette **[page](http://localhost:5173)**.

---

## 5. Commandes utiles

| Commande            | Effet                                 |
| ------------------- | ------------------------------------- |
| `npm run dev`     | Serveur de développement (HMR).      |
| `npm run build`   | Build de production dans`dist/`.    |
| `npm run preview` | Prévisualise le build de production. |
| `npm run lint`    | Vérifie le code (ESLint).            |
| `npm run format`  | Formate le code (Prettier).           |
| `npm run test`    | Lance les tests (Vitest).             |

---

## 6. Structure complète des dossiers et fichiers

```text
kwismo-web/
│
├─ index.html                       # HTML racine & Meta SEO / Titre
├─ package.json                     # Scripts & Dépendances
├─ vite.config.ts                   # Configuration du serveur Vite & des alias
├─ tailwind.config.ts               # Configuration TailwindCSS & thèmes
├─ tsconfig.json                    # Configuration TypeScript
├─ vercel.json                      # Configuration des redirections Vercel (SPA Routing)
│
├─ public/                          # Fichiers statiques servis directement
│  ├─ favicon.svg
│  ├─ robots.txt
│  └─ fonts/                        # Polices auto-hébergées (Ageo, Montserrat, Poppins)
│
└─ src/
   ├─ main.tsx                      # Point d'entrée React DOM
   ├─ App.tsx                       # Composant racine applicatif
   ├─ index.css                     # Directives globales CSS Tailwind & thèmes
   │
   ├─ app/                          # Cœur applicatif (Router, Providers, AuthGuards)
   ├─ assets/                       # Illustrations SVG & Logos Kwismo
   ├─ config/                       # Variables d'environnement & Endpoints API
   │
   ├─ features/                     # Modules applicatifs par domaine
   │  ├─ landing/                   # Landing page publique (Navbar, Hero, Comparison, Pricing, FAQ)
   │  ├─ auth/                      # Authentification (Login, Register, Reset, Partner Register)
   │  ├─ dashboard/                 # Tableau de bord KPI & Graphiques
   │  ├─ numbers/                   # Base des numéros vérifiés & signalés
   │  ├─ partners/                  # Espace Admin : Gestion des partenaires
   │  ├─ partner-request/           # Demandes d'adhésion Partenaire
   │  ├─ users/                     # Espace Admin : Gestion des utilisateurs
   │  ├─ access-control/            # Gestion des Rôles & Permissions
   │  ├─ ussd/                      # Espace Admin/Partenaire : Gestion des codes USSD
   │  ├─ reports/                   # Signalements de fraude & enquêtes
   │  ├─ settings/                  # Paramètres de la plateforme
   │  ├─ profile/                   # Gestion du profil connecté
   │  └─ notifications/             # Centre de notifications
   │
   ├─ locales/                      # Dictionnaires i18n (FR / EN par domaine)
   ├─ shared/                       # Composants réutilisables, UI Radix/Tailwind, Hooks, Lib API
   └─ styles/                       # Fichiers CSS globaux & tokens
│  │  │
│  │  ├─ auth/                       # Connexion, oubli mot de passe, reset
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  ├─ ForgotPasswordForm.tsx
│  │  │  │  └─ ResetPasswordForm.tsx
│  │  │  ├─ hooks/
│  │  │  └─ services/
│  │  │
│  │  ├─ dashboard/                  # Vue KPI d'ensemble
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ user/                       # Espace Partenaire (Profil, Clés API, Paramètres)
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ users/                      # Espace Admin (Gestion des Utilisateurs)
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ partners/                   # Espace Admin (Gestion des Partenaires & Règles)
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ numbers/                    # Base des Numéros et Signalements
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ ussd/                       # Pays, Opérateurs et Actions USSD
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  ├─ access-control/             # Contrôle d'Accès et Matrice de Droits
│  │  │  ├─ index.tsx
│  │  │  └─ components/
│  │  │
│  │  └─ reports/                    # Rapports et Analyses Stratégiques
│  │     ├─ index.tsx
│  │     └─ components/
│  │
│  ├─ shared/                        # Code transverse réellement partagé
│  │  ├─ ui/                         # Composants UI de base (boutons, champs, dialogue)
│  │  │  ├─ badge.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ dropdown-menu.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ phone-input.tsx
│  │  │  ├─ table.tsx
│  │  │  └─ toast.tsx
│  │  ├─ components/                 # Composants applicatifs (Layout, Navigation)
│  │  │  ├─ layout/
│  │  │  │  ├─ AppLayout.tsx
│  │  │  │  ├─ Sidebar.tsx
│  │  │  │  └─ Topbar.tsx
│  │  │  ├─ DataTable.tsx
│  │  │  ├─ ThemeToggle.tsx
│  │  │  ├─ LanguageSwitcher.tsx
│  │  │  ├─ ScrollToTopButton.tsx
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ErrorState.tsx
│  │  │  └─ LoadingSkeleton.tsx
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  │  ├─ api.ts
│  │  │  ├─ axios.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ i18n.ts
│  │  │  ├─ phone.ts
│  │  │  ├─ queryClient.ts
│  │  │  └─ utils.ts
│  │  ├─ mock/
│  │  ├─ store/
│  │  ├─ types/
│  │  └─ constants/
│  │
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tokens.css
│  │
│  └─ locales/                       # Fichiers de traduction i18n (100% sans fallback)
│     ├─ fr/
│     │  ├─ common.json
│     │  ├─ landing.json
│     │  ├─ auth.json
│     │  ├─ admin.json
│     │  └─ partner.json
│     └─ en/
│        ├─ common.json
│        ├─ landing.json
│        ├─ auth.json
│        ├─ admin.json
│        └─ partner.json
│
├─ .env
├─ .env.example
├─ index.html
├─ package.json
├─ vercel.json
├─ tailwind.config.ts
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

---

## 7. Rôle de chaque dossier

| Dossier                | Rôle                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `app/`               | Câblage : router, providers, guards de routes.                                                                |
| `app/guards/`        | 4 guards :`AuthGuard` (session), `ProtectedRoute` (auth), `RoleGuard` (rôle), `GuestGuard` (invité). |
| `features/`          | Une fonctionnalité = un dossier (components + hooks + services + schemas).                                    |
| `shared/ui/`         | Composants de base habillés (boutons, champs, badges…).                                                      |
| `shared/components/` | Layout (sidebar, topbar), DataTable, états (vide/erreur/chargement).                                          |
| `shared/lib/`        | Axios (auth, refresh), TanStack Query, i18next init, formatters, helpers API.                                  |
| `shared/store/`      | État global léger (session, thème, langue).                                                                 |
| `shared/types/`      | Types TypeScript partagés + barrel`index.ts`.                                                               |
| `shared/constants/`  | Constantes UI (labels/couleurs de rôles) + barrel`index.ts`.                                                |
| `styles/`            | Directives Tailwind + design tokens (source unique des couleurs).                                              |
| `locales/`           | Traductions FR/EN par namespace (`common`, `landing`, `auth`, `admin`, `partner`).                   |

**Règle d'or** : une feature n'importe **jamais** le code interne d'une autre feature. Les échanges passent par `shared/`.

---

## 8. Design system & thèmes

- **Couleurs** : bleu `#2D2E83`, orange `#F39200`, vert `#2FAC66`, définies comme design tokens dans `styles/tokens.css` et mappées dans `tailwind.config.ts`.
- **Thème sombre** : stratégie « class » de Tailwind (classe `.dark` sur `<html>`), persistée en `localStorage`, initialisée selon `prefers-color-scheme`.
- **Typographie** : Poppins auto-hébergée (`public/fonts/`).
- **Icônes** : `lucide-react` uniquement.

---

## 9. Internationalisation

- **i18next** : langue par défaut FR, bascule à chaud via `LanguageSwitcher`.
- Fichiers dans `src/locales/{fr,en}/` découpés par namespace (`common`, `landing`, `auth`, `admin`, `partner`).
- **Aucun texte en dur** : tout passe par une clé de traduction.

---

## 10. Données & cache

- **TanStack Query** (`shared/lib/queryClient.ts`) : cache, invalidation après mutation, revalidation au focus.
- **Pagination/filtres** côté serveur, paramètres dans l'URL (partageables).
- **Axios** (`shared/lib/axios.ts`) : intercepteurs pour injecter le token, rafraîchir la session, normaliser les erreurs.

---

## 11. Sécurité front

- Token de session en **cookie httpOnly** (posé par le backend) — **jamais** en localStorage.
- **RoleGuard** : l'interface masque **et** bloque selon le rôle ; la vérité reste côté serveur.
- Validation des formulaires par **Zod**.
- Messages d'erreur non révélateurs (pas d'énumération de comptes).

---

## 12. Variables d'environnement

| Variable              | Exemple                   | Description           |
| --------------------- | ------------------------- | --------------------- |
| `VITE_API_URL`      | `http://localhost:8000` | URL de l'API backend. |
| `VITE_APP_NAME`     | `KWISMO`                | Nom affiché.         |
| `VITE_DEFAULT_LANG` | `fr`                    | Langue par défaut.   |

> Seules des variables **publiques** (`VITE_*`) côté client. Aucun secret.
