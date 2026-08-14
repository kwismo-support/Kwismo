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
4. [Installation & démarrage](#4-installation--démarrage)
5. [Commandes utiles](#5-commandes-utiles)
6. [Structure complète des dossiers et fichiers](#6-structure-complète-des-dossiers-et-fichiers)
7. [Rôle de chaque dossier](#7-rôle-de-chaque-dossier)
8. [Design system & thèmes](#8-design-system--thèmes)
9. [Internationalisation](#9-internationalisation)
10. [Données & cache](#10-données--cache)
11. [Sécurité front](#11-sécurité-front)
12. [Variables d'environnement](#12-variables-denvironnement)

---

## 1. Description

Le web KWISMO comprend :

- une **landing page** publique (hero, problème/fraude, comparatif, fonctionnalités, « comment ça marche », partenaires, **tarifs API à 0,001 $/appel**, CTA, footer) ;
- un **espace Admin** (supervision globale : utilisateurs, partenaires, numéros, pays/opérateurs/USSD, droits, KPI) ;
- un **espace Partenaire** (mêmes types de pages, mais cloisonnées au périmètre de l'entreprise).

Caractéristiques : **thème clair/sombre**, **français/anglais**, **responsive 100 %**, accessibilité **WCAG AA**.

---

## 2. Stack technique

| Domaine | Technologie |
| ------- | ----------- |
| Build | Vite |
| Framework | React 18 (JSX/TSX) |
| Langage | TypeScript |
| Styles | TailwindCSS |
| Composants | shadcn/ui + Radix UI |
| Icônes | lucide-react *(aucune emoji)* |
| Routing | React Router v6 |
| Données serveur | TanStack Query |
| État client | Zustand |
| Formulaires | React Hook Form + Zod |
| i18n | i18next + react-i18next |
| Graphiques | Recharts |
| HTTP | Axios (instance + intercepteurs) |
| Qualité | ESLint + Prettier |
| Tests | Vitest + Testing Library |

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

| Commande | Effet |
| -------- | ----- |
| `npm run dev` | Serveur de développement (HMR). |
| `npm run build` | Build de production dans `dist/`. |
| `npm run preview` | Prévisualise le build de production. |
| `npm run lint` | Vérifie le code (ESLint). |
| `npm run format` | Formate le code (Prettier). |
| `npm run test` | Lance les tests (Vitest). |

---

## 6. Structure complète des dossiers et fichiers

```text
kwismo-web/
│
├─ public/
│  ├─ favicon.svg
│  ├─ robots.txt
│  └─ fonts/                         # Poppins auto-hébergée (performance)
│     ├─ Poppins-Regular.woff2
│     ├─ Poppins-Medium.woff2
│     ├─ Poppins-SemiBold.woff2
│     └─ Poppins-Bold.woff2
│
├─ src/
│  ├─ main.tsx                       # Point d'entrée React (montage <App/>)
│  ├─ App.tsx                        # Composition des providers + router
│  ├─ vite-env.d.ts
│  │
│  ├─ app/                           # Cœur applicatif
│  │  ├─ router.tsx                  # Définition des routes + lazy loading
│  │  ├─ providers.tsx               # Query, Theme, i18n, Auth (composés)
│  │  └─ guards/
│  │     ├─ AuthGuard.tsx            # Vérifie la session au montage (fetchMe)
│  │     ├─ GuestGuard.tsx           # Redirige si déjà connecté (pages /auth/*)
│  │     ├─ ProtectedRoute.tsx       # Bloque l'accès si non authentifié
│  │     └─ RoleGuard.tsx            # Bloque selon le rôle (admin/partner)
│  │
│  ├─ assets/
│  │  ├─ logo/
│  │  │  ├─ logo-horizontal.svg
│  │  │  └─ logo-vertical.svg
│  │  └─ illustrations/
│  │     ├─ hero.svg
│  │     └─ empty-state.svg
│  │
│  ├─ config/
│  │  ├─ env.ts                      # Lecture typée des variables VITE_*
│  │  ├─ constants.ts                # Constantes globales
│  │  └─ endpoints.ts                # Chemins des routes API
│  │
│  ├─ features/                      # ★ Une fonctionnalité = un dossier
│  │  │
│  │  ├─ landing/
│  │  │  ├─ index.tsx                # Page d'assemblage de la landing
│  │  │  ├─ components/
│  │  │  │  ├─ Navbar.tsx
│  │  │  │  ├─ Hero.tsx
│  │  │  │  ├─ FraudProblem.tsx
│  │  │  │  ├─ Comparison.tsx        # Tableau Truecaller/Whoscall/KWISMO
│  │  │  │  ├─ Features.tsx
│  │  │  │  ├─ HowItWorks.tsx
│  │  │  │  ├─ Partners.tsx
│  │  │  │  ├─ Pricing.tsx           # Offre API 0,001 $/appel
│  │  │  │  ├─ DownloadCTA.tsx
│  │  │  │  └─ Footer.tsx
│  │  │  └─ sections/
│  │  │     └─ landingSections.ts    # Ordre et configuration des sections
│  │  │
│  │  ├─ auth/
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  ├─ ForgotPasswordForm.tsx
│  │  │  │  └─ ResetPasswordForm.tsx
│  │  │  ├─ hooks/
│  │  │  │  ├─ useLogin.ts
│  │  │  │  └─ useResetPassword.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.api.ts
│  │  │  └─ schemas/
│  │  │     └─ auth.schema.ts        # Zod : loginSchema, resetSchema
│  │  │
│  │  ├─ dashboard/                  # KPI globaux (admin) / KPI partenaire
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ KpiCard.tsx
│  │  │  │  ├─ TrendChart.tsx
│  │  │  │  └─ FraudByOperatorChart.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useKpi.ts
│  │  │  └─ services/
│  │  │     └─ kpi.api.ts
│  │  │
│  │  ├─ users/
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ UsersTable.tsx
│  │  │  │  └─ UserDetailPanel.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useUsers.ts
│  │  │  └─ services/
│  │  │     └─ users.api.ts
│  │  │
│  │  ├─ partners/                   # Admin uniquement
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ PartnersTable.tsx
│  │  │  │  ├─ PartnerForm.tsx
│  │  │  │  └─ AffiliationRulesEditor.tsx   # Préfixes 69, 651-654, 68…
│  │  │  ├─ hooks/
│  │  │  │  └─ usePartners.ts
│  │  │  └─ services/
│  │  │     └─ partners.api.ts
│  │  │
│  │  ├─ numbers/
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ NumbersTable.tsx
│  │  │  │  └─ NumberStatusBadge.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useNumbers.ts
│  │  │  └─ services/
│  │  │     └─ numbers.api.ts
│  │  │
│  │  ├─ ussd/                       # Pays / Opérateurs / Codes USSD (admin)
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ CountriesPanel.tsx
│  │  │  │  ├─ OperatorsPanel.tsx
│  │  │  │  └─ UssdActionsPanel.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useUssd.ts
│  │  │  └─ services/
│  │  │     └─ ussd.api.ts
│  │  │
│  │  ├─ access-control/             # Rôles & droits (admin)
│  │  │  ├─ index.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ RolesList.tsx
│  │  │  │  └─ PermissionsMatrix.tsx
│  │  │  └─ services/
│  │  │     └─ access.api.ts
│  │  │
│  │  └─ reports/                    # Rapports stratégiques (partenaire)
│  │     ├─ index.tsx
│  │     ├─ components/
│  │     │  └─ ReportsView.tsx
│  │     └─ services/
│  │        └─ reports.api.ts
│  │
│  ├─ shared/                        # Code transverse réellement partagé
│  │  ├─ ui/                         # Composants shadcn/ui habillés
│  │  │  ├─ button.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ dropdown-menu.tsx
│  │  │  ├─ toast.tsx
│  │  │  └─ table.tsx
│  │  ├─ components/                 # Composants applicatifs transverses
│  │  │  ├─ layout/
│  │  │  │  ├─ AppLayout.tsx
│  │  │  │  ├─ Sidebar.tsx
│  │  │  │  ├─ Topbar.tsx
│  │  │  │  └─ Breadcrumb.tsx
│  │  │  ├─ DataTable.tsx            # Tableau générique (tri, filtres, pagination)
│  │  │  ├─ ThemeToggle.tsx          # Bascule clair/sombre
│  │  │  ├─ LanguageSwitcher.tsx     # FR/EN
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ErrorState.tsx
│  │  │  └─ LoadingSkeleton.tsx
│  │  ├─ hooks/
│  │  │  ├─ useTheme.ts
│  │  │  ├─ useDebounce.ts
│  │  │  └─ useMediaQuery.ts
│  │  ├─ lib/
│  │  │  ├─ axios.ts                 # Instance Axios + intercepteurs (auth, refresh)
│  │  │  ├─ api.ts                   # Helpers get/post/patch/put/delete (wrappent axios)
│  │  │  ├─ i18n.ts                  # Initialisation i18next + namespaces + détecteur
│  │  │  ├─ queryClient.ts           # Configuration TanStack Query
│  │  │  ├─ utils.ts                 # cn() et helpers
│  │  │  └─ formatters.ts            # Dates, nombres, devises (Intl)
│  │  ├─ store/
│  │  │  ├─ authStore.ts             # Zustand : session
│  │  │  ├─ themeStore.ts
│  │  │  └─ languageStore.ts
│  │  ├─ types/
│  │  │  ├─ user.ts
│  │  │  ├─ number.ts
│  │  │  ├─ partner.ts
│  │  │  ├─ api.ts                   # ApiError, Paginated<T>…
│  │  │  └─ index.ts                 # Barrel : re-exports de tous les types
│  │  └─ constants/
│  │     ├─ roles.ts                 # ROLE_LABELS, ROLE_COLORS
│  │     └─ index.ts                 # Barrel : re-exports des constantes
│  │
│  ├─ styles/
│  │  ├─ globals.css                 # Directives Tailwind + reset
│  │  └─ tokens.css                  # Design tokens (couleurs clair/sombre)
│  │
│  └─ locales/                       # Traductions i18n
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
├─ .env                             # Variables réelles (NON versionné)
├─ .env.example
├─ .gitignore
├─ .eslintrc.cjs
├─ .prettierrc
├─ index.html                        # Point d'entrée HTML (Vite)
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts                # Mapping des design tokens
├─ tsconfig.json                     # Alias @/ vers src/
├─ vite.config.ts
└─ README.md                         # Ce fichier
```

---

## 7. Rôle de chaque dossier

| Dossier | Rôle |
| ------- | ---- |
| `app/` | Câblage : router, providers, guards de routes. |
| `app/guards/` | 4 guards : `AuthGuard` (session), `ProtectedRoute` (auth), `RoleGuard` (rôle), `GuestGuard` (invité). |
| `features/` | Une fonctionnalité = un dossier (components + hooks + services + schemas). |
| `shared/ui/` | Composants de base habillés (boutons, champs, badges…). |
| `shared/components/` | Layout (sidebar, topbar), DataTable, états (vide/erreur/chargement). |
| `shared/lib/` | Axios (auth, refresh), TanStack Query, i18next init, formatters, helpers API. |
| `shared/store/` | État global léger (session, thème, langue). |
| `shared/types/` | Types TypeScript partagés + barrel `index.ts`. |
| `shared/constants/` | Constantes UI (labels/couleurs de rôles) + barrel `index.ts`. |
| `styles/` | Directives Tailwind + design tokens (source unique des couleurs). |
| `locales/` | Traductions FR/EN par namespace (`common`, `landing`, `auth`, `admin`, `partner`). |

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

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `VITE_API_URL` | `http://localhost:8000` | URL de l'API backend. |
| `VITE_APP_NAME` | `KWISMO` | Nom affiché. |
| `VITE_DEFAULT_LANG` | `fr` | Langue par défaut. |

> Seules des variables **publiques** (`VITE_*`) côté client. Aucun secret.
