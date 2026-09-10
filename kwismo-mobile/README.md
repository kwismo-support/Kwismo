# KWISMO — Mobile

## Application iOS & Android · React Native · Expo · NativeWind

[![React Native](https://img.shields.io/badge/React%20Native-Expo-2D2E83)](https://expo.dev)
[![NativeWind](https://img.shields.io/badge/NativeWind-Tailwind-2FAC66)](https://nativewind.dev)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-file--based-F39200)](https://docs.expo.dev/router/introduction/)

---

## Table des matières

1. [Description](#1-description)
2. [Stack technique](#2-stack-technique)
3. [Prérequis](#3-prérequis)
4. [Installation & démarrage](#4-installation--démarrage)
5. [Commandes utiles](#5-commandes-utiles)
6. [Structure complète des dossiers et fichiers](#6-structure-complète-des-dossiers-et-fichiers)
7. [Rôle de chaque dossier](#7-rôle-de-chaque-dossier)
8. [Navigation (Expo Router)](#8-navigation-expo-router)
9. [Design system & thèmes](#9-design-system--thèmes)
10. [Internationalisation](#10-internationalisation)
11. [Sécurité & stockage](#11-sécurité--stockage)
12. [Permissions natives](#12-permissions-natives)
13. [Variables d'environnement](#13-variables-denvironnement)

---

## 1. Description

L'application mobile KWISMO est destinée aux **utilisateurs finaux**. Elle couvre :

- **Onboarding/Splash** animé au premier lancement ;
- **Connexion** par numéro de téléphone (sélection du pays + validation) puis **OTP** ;
- **Accueil/Dashboard** avec **KPI personnels** ;
- **Vérification de numéro**, **Transfert USSD** (pays → opérateur → action) ;
- **Liste de contacts à insignes**, **Alerte WhatsApp** (compte piraté) ;
- **Détection d'appel suspect**, **Signalement**, **Formulaire d'enquête**, **Profil & sécurité**.

Caractéristiques : **thème clair/sombre**, **français/anglais**, **responsive 100 %**, accessibilité.

---

## 2. Stack technique

| Domaine | Technologie |
| ------- | ----------- |
| Framework | React Native (via **Expo**) |
| Langage | TypeScript |
| Navigation | Expo Router (file-based) |
| Styles | NativeWind (TailwindCSS) |
| Icônes | lucide-react-native *(aucune emoji)* |
| Données serveur | TanStack Query |
| État client | Zustand |
| Formulaires | React Hook Form + Zod |
| Téléphone | libphonenumber-js + country-selector |
| i18n | i18next + react-i18next |
| Stockage sécurisé | expo-secure-store |
| Contacts / Appels | expo-contacts + module natif |
| Animations | Reanimated + Moti |
| Graphiques | react-native-gifted-charts |

---

## 3. Prérequis

```bash
node --version              # 20 LTS+
npm --version               # 10+
npx expo --version          # Expo CLI
```

- **Expo Go** installé sur ton téléphone (iOS/Android) pour tester rapidement, **ou** un émulateur Android (Android Studio) / simulateur iOS (Xcode, macOS).

---

## 4. Installation & démarrage

```bash
# 1. Se placer dans le dossier
cd kwismo-mobile

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
#   → éditer EXPO_PUBLIC_API_URL (URL du backend)

# 4. Démarrer le serveur Expo
npx expo start
```

Puis :

- **Téléphone** : scanne le QR code avec l'app **Expo Go**.
- **Android** : appuie sur `a` (émulateur).
- **iOS** : appuie sur `i` (simulateur, macOS).

---

## 5. Commandes utiles

| Commande | Effet |
| -------- | ----- |
| `npx expo start` | Démarre le serveur de développement (QR code). |
| `npx expo start --clear` | Démarre en vidant le cache. |
| `npx expo start --android` | Ouvre directement l'émulateur Android. |
| `npx expo start --ios` | Ouvre le simulateur iOS. |
| `npx expo run:android` | Build natif Android (dev client). |
| `npx expo run:ios` | Build natif iOS (dev client). |
| `eas build -p android` | Build de production Android (EAS). |
| `eas build -p ios` | Build de production iOS (EAS). |
| `npm run lint` | Vérifie le code. |

---

## 6. Structure complète des dossiers et fichiers

```text
kwismo-mobile/
│
├─ app.config.js                    # ★ Configuration Expo dynamique (Kwismo vs Kwismo-Test)
├─ app.json                         # Configuration de base Expo
├─ eas.json                         # ★ Profils de build EAS (APK Android & IPA iOS)
├─ .easignore                       # ★ Exclusion des fichiers hors-mobile pour EAS Build
├─ package.json                     # Scripts & dépendances (inclut sharp, expo-updates)
├─ babel.config.js
├─ metro.config.js
├─ tailwind.config.js
├─ tsconfig.json
│
├─ scripts/
│  └─ optimize-assets.js            # ★ Auto-optimisation automatique des ressources lourdes
│
├─ app/                             # ★ Routes (Expo Router, file-based)
│  ├─ _layout.tsx                   # Layout racine : providers globaux & OTA Updates silencieux
│  ├─ index.tsx                     # Redirection initiale (splash → auth/app)
│  ├─ onboarding.tsx                # Écran d'onboarding
│  │
│  ├─ (auth)/                       # Groupe NON authentifié
│  │  ├─ _layout.tsx
│  │  ├─ login.tsx
│  │  ├─ register.tsx
│  │  ├─ otp.tsx
│  │  ├─ otp-success.tsx
│  │  ├─ welcome.tsx
│  │  ├─ forgot-password.tsx
│  │  └─ reset-password.tsx
│  │
│  └─ (app)/                        # Groupe authentifié (protégé)
│     ├─ _layout.tsx
│     ├─ index.tsx                  # Dashboard principal
│     ├─ verify.tsx                 # Vérification de numéro
│     ├─ transfer.tsx               # Transfert USSD
│     ├─ contacts.tsx               # Liste des contacts
│     ├─ alert-whatsapp.tsx         # Alerte compte piraté
│     ├─ report.tsx                 # Signalement
│     ├─ survey.tsx                 # Enquête
│     ├─ profile.tsx                # Profil utilisateur
│     ├─ edit-profile.tsx           # Édition du profil
│     ├─ security.tsx               # Sécurité
│     ├─ pin-setup.tsx              # Code PIN
│     ├─ two-factor.tsx             # Double authentification (2FA)
│     ├─ notifications.tsx          # Notifications
│     └─ management.tsx             # Gestion & paramètres
│
├─ assets/                          # Ressources visuelles optimisées
│  ├─ adaptive-icon.png
│  ├─ icon.png
│  ├─ logo-icon.png
│  ├─ logo-white.png
│  ├─ logo.png
│  ├─ splash.png
│  ├─ slide1.jpg
│  ├─ slide2.jpg
│  └─ slide3.jpg
│
└─ src/                            # Code source modulaire
   ├─ features/                     # Logique métier par fonctionnalité (auth, verify, transfer, etc.)
   ├─ locales/                      # Internationalisation i18n (fr/en)
   ├─ shared/                       # Composants UI, hooks, store, utils & useOTAUpdates.ts
   └─ styles/                       # Tokens de style & thèmes
│
├─ src/
│  ├─ features/                     # Logique métier par fonctionnalité
│  │  │
│  │  ├─ auth/
│  │  │  ├─ components/
│  │  │  │  ├─ CountrySelector.tsx
│  │  │  │  ├─ PhoneInput.tsx
│  │  │  │  └─ OtpInput.tsx
│  │  │  ├─ hooks/
│  │  │  │  ├─ useLogin.ts
│  │  │  │  └─ useOtp.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.api.ts
│  │  │  └─ schemas/
│  │  │     └─ auth.schema.ts
│  │  │
│  │  ├─ dashboard/
│  │  │  ├─ components/
│  │  │  │  ├─ KpiCard.tsx
│  │  │  │  ├─ QuickActions.tsx
│  │  │  │  └─ RecentActivity.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useDashboard.ts
│  │  │  └─ services/
│  │  │     └─ dashboard.api.ts
│  │  │
│  │  ├─ verify/
│  │  │  ├─ components/
│  │  │  │  ├─ VerifyInput.tsx
│  │  │  │  └─ RiskResultCard.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useVerify.ts
│  │  │  └─ services/
│  │  │     └─ verify.api.ts
│  │  │
│  │  ├─ transfer/
│  │  │  ├─ components/
│  │  │  │  ├─ TransferStepper.tsx
│  │  │  │  ├─ AmountInput.tsx
│  │  │  │  └─ UssdConfirm.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useTransfer.ts
│  │  │  ├─ services/
│  │  │  │  └─ transfer.api.ts
│  │  │  └─ lib/
│  │  │     └─ ussd.ts
│  │  │
│  │  ├─ contacts/
│  │  │  ├─ components/
│  │  │  │  ├─ ContactItem.tsx
│  │  │  │  └─ StatusBadge.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useContacts.ts
│  │  │  └─ services/
│  │  │     └─ contacts.api.ts
│  │  │
│  │  ├─ whatsapp-alert/
│  │  │  ├─ components/
│  │  │  │  ├─ ContactPicker.tsx
│  │  │  │  └─ AlertMessageForm.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useWhatsappAlert.ts
│  │  │  └─ services/
│  │  │     └─ whatsapp.api.ts
│  │  │
│  │  ├─ call-detection/
│  │  │  ├─ components/
│  │  │  │  ├─ CallOverlay.tsx
│  │  │  │  └─ DetectionSettings.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useCallDetection.ts
│  │  │  └─ services/
│  │  │     └─ call.api.ts
│  │  │
│  │  ├─ report/
│  │  │  ├─ components/
│  │  │  │  └─ ReportForm.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useReport.ts
│  │  │  └─ services/
│  │  │     └─ report.api.ts
│  │  │
│  │  ├─ survey/
│  │  │  ├─ components/
│  │  │  │  └─ SurveySheet.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useSurvey.ts
│  │  │  └─ services/
│  │  │     └─ survey.api.ts
│  │  │
│  │  └─ profile/
│  │     ├─ components/
│  │     │  ├─ ProfileForm.tsx
│  │     │  ├─ SecuritySettings.tsx
│  │     │  └─ PreferencesSettings.tsx
│  │     ├─ hooks/
│  │     │  └─ useProfile.ts
│  │     └─ services/
│  │        └─ profile.api.ts
│  │
│  ├─ shared/
│  │  ├─ ui/                        # Composants de base
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Badge.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ BottomSheet.tsx
│  │  │  ├─ Modal.tsx
│  │  │  └─ Toast.tsx
│  │  ├─ components/
│  │  │  ├─ AppHeader.tsx
│  │  │  ├─ TabBar.tsx
│  │  │  ├─ ScreenState.tsx
│  │  │  ├─ ThemeToggle.tsx
│  │  │  └─ LanguageSwitcher.tsx
│  │  ├─ hooks/
│  │  │  ├─ useTheme.ts
│  │  │  ├─ useDebounce.ts
│  │  │  └─ useNetworkStatus.ts
│  │  ├─ lib/
│  │  │  ├─ axios.ts
│  │  │  ├─ queryClient.ts
│  │  │  ├─ phone.ts
│  │  │  ├─ secureStore.ts
│  │  │  └─ utils.ts
│  │  ├─ services/
│  │  │  ├─ apiClient.ts
│  │  │  ├─ database.ts
│  │  │  ├─ device.ts
│  │  │  └─ syncEngine.ts
│  │  ├─ store/
│  │  │  ├─ authStore.ts
│  │  │  ├─ themeStore.ts
│  │  │  └─ languageStore.ts
│  │  ├─ types/
│  │  │  ├─ user.ts
│  │  │  ├─ number.ts
│  │  │  └─ api.ts
│  │  └─ constants/
│  │     └─ config.ts
│  │
│  ├─ styles/
│  │  └─ tokens.ts                  # Design tokens (couleurs clair/sombre)
│  │
│  └─ locales/
│     ├─ fr/
│     │  ├─ common.json
│     │  ├─ auth.json
│     │  └─ app.json
│     └─ en/
│        ├─ common.json
│        ├─ auth.json
│        └─ app.json
│
├─ assets/                          # Ressources natives
│  ├─ icon.png                      # Icône de l'app
│  ├─ adaptive-icon.png             # Icône adaptative Android
│  ├─ splash.png                    # Écran de démarrage
│  ├─ notification-icon.png
│  └─ fonts/
│     ├─ Aptos-Regular.ttf
│     ├─ Aptos-Medium.ttf
│     ├─ Aptos-SemiBold.ttf
│     └─ Aptos-Bold.ttf
│
├─ .env                             # Variables réelles (NON versionné)
├─ .env.example
├─ .gitignore
├─ app.json                         # Config Expo (nom, icône, splash, permissions)
├─ babel.config.js                  # Preset Expo + NativeWind
├─ metro.config.js                  # Bundler Metro (+ NativeWind)
├─ tailwind.config.js               # Tokens → NativeWind
├─ tsconfig.json                    # Alias @/ vers src/
├─ eas.json                         # Configuration des builds EAS
├─ package.json
└─ README.md                         # Ce fichier
```

---

## 7. Rôle de chaque dossier

| Dossier | Rôle |
| ------- | ---- |
| `app/` | **Routes uniquement** (Expo Router). Câblage des écrans, pas de logique. |
| `app/(auth)/` | Groupe d'écrans non authentifiés (connexion, OTP, reset). |
| `app/(app)/` | Groupe protégé (redirige vers login si pas de session). |
| `src/features/` | Logique métier par fonctionnalité (components + hooks + services). |
| `src/shared/ui/` | Composants de base (boutons, champs, bottom sheets…). |
| `src/shared/lib/` | Axios, Query, téléphone, **secureStore** (tokens). |
| `src/shared/store/` | État global léger (session, thème, langue). |
| `src/styles/tokens.ts` | Source unique des couleurs. |
| `src/locales/` | Traductions FR/EN. |
| `assets/` | Icône, splash, polices Aptos. |

**Séparation clé** : `app/` ne contient que le **routing** ; toute la logique vit dans `src/features/`. Cela garde les routes lisibles et la logique testable.

---

## 8. Navigation (Expo Router)

La navigation est **basée sur les fichiers** : chaque fichier dans `app/` devient une route.

- `app/(auth)/` et `app/(app)/` sont des **groupes** (parenthèses = pas de segment d'URL).
- `app/(app)/_layout.tsx` définit la **barre d'onglets** (Accueil, Vérifier, Contacts, Signaler, Profil).
- `app/(app)/_layout.tsx` protège l'accès : redirige vers `(auth)/login` si aucune session valide.

---

## 9. Design system & thèmes

- **Couleurs** : bleu `#2D2E83`, orange `#F39200`, vert `#2FAC66` (tokens dans `src/styles/tokens.ts`, mappés dans `tailwind.config.js`).
- **Thème sombre** : géré par NativeWind, persistant, suit la préférence système par défaut.
- **Typographie** : **Aptos** (chargée depuis `assets/fonts/`).
- **Icônes** : `lucide-react-native` ; drapeaux via un jeu dédié, **jamais d'emoji**.

---

## 10. Internationalisation

- **i18next** : défaut FR, bascule à chaud, persistance ; détection de la langue de l'appareil au premier lancement.
- Fichiers dans `src/locales/{fr,en}/` par namespace (`common`, `auth`, `app`).

---

## 11. Sécurité & stockage

- **Tokens** : stockés **exclusivement** dans `expo-secure-store` (Keychain iOS / Keystore Android). Jamais en AsyncStorage en clair.
- **Préférences** (thème, langue) : AsyncStorage (non sensibles).
- **Verrouillage biométrique** optionnel (Face ID / empreinte) pour rouvrir l'app.
- **Mode hors-ligne** : données en cache consultables, bandeau « Mode hors-ligne ».

---

## 12. Permissions natives

Déclarées dans `app.json` et demandées **au moment opportun** (juste avant l'usage), avec explication :

| Permission | Usage |
| ---------- | ----- |
| Contacts | Liste de contacts à insignes. |
| Téléphone / Appels | Détection d'appel suspect, composition USSD. |
| Notifications | Alertes et formulaires d'enquête. |

---

## 13. Variables d'environnement

| Variable | Exemple | Description |
| -------- | ------- | ----------- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8000` | URL de l'API backend. |
| `EXPO_PUBLIC_APP_NAME` | `KWISMO` | Nom affiché. |
| `EXPO_PUBLIC_DEFAULT_LANG` | `fr` | Langue par défaut. |

> Les variables `EXPO_PUBLIC_*` sont accessibles côté app. Aucun secret sensible.
