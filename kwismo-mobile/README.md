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
├─ package.json                     # Scripts & dépendances (inclut sharp, expo-updates, eas-cli)
├─ babel.config.js                  # Configuration Babel & NativeWind
├─ metro.config.js                  # Configuration du bundler Metro
├─ tailwind.config.js               # Configuration TailwindCSS mobile
├─ tsconfig.json                    # Configuration TypeScript
│
├─ scripts/
│  └─ optimize-assets.js            # ★ Auto-optimisation dynamique des ressources lourdes
│
├─ app/                             # ★ Routes (Expo Router, file-based)
│  ├─ _layout.tsx                   # Layout racine : providers globaux & OTA Updates silencieux
│  ├─ index.tsx                     # Redirection initiale (splash → auth/app)
│  ├─ onboarding.tsx                # Écran d'onboarding animé
│  │
│  ├─ (auth)/                       # Groupe d'écrans NON authentifié
│  │  ├─ _layout.tsx
│  │  ├─ login.tsx                  # Connexion numéro & mot de passe
│  │  ├─ register.tsx               # Création de compte
│  │  ├─ otp.tsx                    # Saisie et vérification du code OTP
│  │  ├─ otp-success.tsx            # Écran de succès validation OTP
│  │  ├─ welcome.tsx                # Écran d'accueil Auth
│  │  ├─ forgot-password.tsx        # Oubli de mot de passe
│  │  └─ reset-password.tsx         # Réinitialisation de mot de passe
│  │
│  └─ (app)/                        # Groupe d'écrans authentifié (protégé)
│     ├─ _layout.tsx
│     ├─ index.tsx                  # Dashboard principal (KPI & Actions rapides)
│     ├─ verify.tsx                 # Vérification instantanée de numéro suspect
│     ├─ transfer.tsx               # Transfert USSD & Mobile Money sécurisé
│     ├─ contacts.tsx               # Liste des contacts & badges de risque
│     ├─ alert-whatsapp.tsx         # Alerte WhatsApp (compte piraté)
│     ├─ report.tsx                 # Formulaire de signalement de fraude
│     ├─ survey.tsx                 # Enquête utilisateur post-signalement
│     ├─ profile.tsx                # Profil utilisateur & récapitulatif
│     ├─ edit-profile.tsx           # Édition des informations personnelles
│     ├─ security.tsx               # Paramètres de sécurité (PIN, Biométrie, 2FA)
│     ├─ pin-setup.tsx              # Configuration du code PIN
│     ├─ two-factor.tsx             # Configuration Double Authentification
│     ├─ notifications.tsx          # Centre de notifications & alertes
│     └─ management.tsx             # Gestion de compte & paramètres avancés
│
├─ assets/                          # Ressources visuelles optimisées (< 150 KB)
│  ├─ adaptive-icon.png             # Icône adaptative Android
│  ├─ icon.png                      # Icône principale de l'application
│  ├─ logo-icon.png                 # Picto logo Kwismo
│  ├─ logo-white.png                # Logo Kwismo version blanche
│  ├─ logo.png                      # Logo Kwismo version couleur
│  ├─ splash.png                    # Écran de démarrage (Splash screen)
│  ├─ slide1.jpg                    # Visuel onboarding 1 (Protection)
│  ├─ slide2.jpg                    # Visuel onboarding 2 (Transfert)
│  └─ slide3.jpg                    # Visuel onboarding 3 (Vérification)
│
└─ src/                            # Code source modulaire
   ├─ features/                     # Logique métier découpée par domaine
   │  ├─ auth/
   │  │  ├─ components/ (CountrySelector.tsx, OtpInput.tsx, PhoneInput.tsx)
   │  │  ├─ hooks/ (useLogin.ts, useOtp.ts, useRegister.ts, useForgotPassword.ts)
   │  │  ├─ schemas/ (auth.schema.ts)
   │  │  └─ services/ (auth.api.ts)
   │  ├─ call-detection/
   │  │  ├─ components/ (CallOverlay.tsx, CallWarningModal.tsx, DetectionSettings.tsx)
   │  │  ├─ hooks/ (useCallDetection.ts)
   │  │  └─ services/ (call.api.ts, callDetection.api.ts)
   │  ├─ contacts/
   │  │  ├─ components/ (ContactItem.tsx, StatusBadge.tsx)
   │  │  ├─ hooks/ (useContacts.ts)
   │  │  └─ services/ (contacts.api.ts)
   │  ├─ dashboard/
   │  │  ├─ components/ (KpiCard.tsx, QuickActions.tsx, RecentActivity.tsx)
   │  │  ├─ hooks/ (useDashboard.ts)
   │  │  └─ services/ (dashboard.api.ts)
   │  ├─ notifications/
   │  │  ├─ hooks/ (useNotifications.ts)
   │  │  └─ services/ (notifications.api.ts)
   │  ├─ numbers/
   │  │  ├─ hooks/ (useNumbers.ts, useUserPhones.ts)
   │  │  └─ services/ (numbers.api.ts)
   │  ├─ profile/
   │  │  ├─ components/ (PreferencesSettings.tsx, ProfileForm.tsx, SecuritySettings.tsx)
   │  │  ├─ hooks/ (useProfile.ts)
   │  │  └─ services/ (profile.api.ts)
   │  ├─ report/
   │  │  ├─ components/ (ReportForm.tsx)
   │  │  ├─ hooks/ (useReport.ts)
   │  │  └─ services/ (report.api.ts)
   │  ├─ survey/
   │  │  ├─ components/ (SurveySheet.tsx)
   │  │  ├─ hooks/ (useSurvey.ts)
   │  │  └─ services/ (survey.api.ts)
   │  ├─ transfer/
   │  │  ├─ components/ (AmountInput.tsx, TransferStepper.tsx, UssdConfirm.tsx)
   │  │  ├─ hooks/ (useTransfer.ts)
   │  │  ├─ lib/ (ussd.ts)
   │  │  └─ services/ (transfer.api.ts)
   │  ├─ verify/
   │  │  ├─ components/ (RiskResultCard.tsx, VerifyInput.tsx)
   │  │  ├─ hooks/ (useVerify.ts, useVerifyNumber.ts)
   │  │  └─ services/ (verify.api.ts)
   │  └─ whatsapp-alert/
   │     ├─ components/ (AlertMessageForm.tsx, ContactPicker.tsx)
   │     ├─ hooks/ (useWhatsappAlert.ts)
   │     └─ services/ (whatsapp.api.ts)
   │
   ├─ locales/                      # Internationalisation i18n
   │  ├─ en/ (app.json, auth.json, common.json)
   │  ├─ fr/ (app.json, auth.json, common.json)
   │  ├─ en.json, fr.json
   │  └─ i18n.ts                    # Initialisation d'i18next
   │
   ├─ shared/                       # Éléments partagés dans toute l'application
   │  ├─ components/                # Modales, Barres d'en-tête, Arrière-plans, Pickers
   │  ├─ config/ (env.ts)
   │  ├─ constants/ (config.ts)
   │  ├─ hooks/ (useTheme.ts, useAppTheme.ts, useBiometricLock.ts, useNetworkStatus.ts, useDebounce.ts)
   │  ├─ lib/ (axios.ts, contactsService.ts, phone.ts, queryClient.ts, responsive.ts, secureStore.ts)
   │  ├─ mock/ (notificationsMock.ts, simNumbersMock.ts, transactionsMock.ts)
   │  ├─ services/ (apiClient.ts, database.ts, device.ts, simService.ts, storage.ts, syncEngine.ts)
   │  ├─ store/ (authStore.ts, languageStore.ts, themeStore.ts, toastStore.ts)
   │  ├─ types/ (api.ts, number.ts, user.ts)
   │  ├─ ui/ (Badge.tsx, BottomSheet.tsx, Button.tsx, Card.tsx, DataTable.tsx, Icon.tsx, Input.tsx, Modal.tsx, Toast.tsx)
   │  └─ utils/ (useOTAUpdates.ts)  # ★ Hook de mise à jour automatique et silencieuse
   │
   └─ styles/
      └─ tokens.ts                  # Définition des couleurs, polices et espacements
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
