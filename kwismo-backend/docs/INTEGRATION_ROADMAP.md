# KWISMO Web → Backend — Feuille de Route d'Intégration
> Supprimer ce fichier une fois l'intégration terminée.
> Backend en production : `https://api.kwismo.com` | Toutes les routes : `/api/v1/*`
> Swagger interactif : `https://api.kwismo.com/docs`

---

## Pré-requis globaux (à faire EN PREMIER, une seule fois)

| # | Action | Fichier | État |
|---|---|---|---|
| 1 | Mettre `VITE_USE_MOCK=false` | `kwismo-web/.env` | ⬜ À faire |
| 2 | Mettre `VITE_API_URL=https://api.kwismo.com/api/v1` | `kwismo-web/.env` | ⬜ Vérifier |
| 3 | Vérifier que l'URL de base Axios est correcte | `src/shared/lib/axios.ts` | ✅ Déjà configuré |
| 4 | Vérifier que l'intercepteur de token est actif | `src/shared/lib/axios.ts` | ✅ Déjà branché |
| 5 | Vérifier que le rafraîchissement automatique (401) est actif | `src/shared/lib/axios.ts` | ✅ Déjà branché |

> **Note :** `env.apiUrl` pointe par défaut sur `http://localhost:7001/api/v1` en dev. Modifier le `.env` avant tout test en production.

---

## Vague 1 — Authentification (chemin critique, à faire en premier)

### `src/features/auth/services/auth.api.ts`
**État :** Partiellement branché. Login, inscription partenaire, mot de passe oublié/réinitialiser sont connectés mais avec des erreurs.

| Fonction | État actuel | Action requise |
|---|---|---|
| `login()` | ✅ Appelle `POST /auth/login` | **Corriger :** après la réponse, vérifier `response.data.device_verification_required === true` et rediriger vers l'écran OTP appareil. Actuellement tout 200 = connecté, ce qui est faux. |
| `registerPartner()` | ✅ Appelle `POST /partners/request` | ✅ Bon état |
| `forgotPassword()` | ✅ Appelle `/auth/password/forgot` | **Vérifier** que le chemin correspond exactement à celui du backend |
| `resetPassword()` | ⚠️ Appelle `/auth/reset-password` | **Corriger :** le chemin backend est `/auth/password/reset`. De plus, envoie `token: 'reset-token'` codé en dur — doit lire le vrai token depuis l'URL : `new URLSearchParams(window.location.search).get('token')` |
| `register()` | ❌ **Absent** | **Ajouter :** `POST /auth/register` avec `{ nom, prenom, email, mot_de_passe }`. Après succès, rediriger vers la page de vérification OTP |
| `verifyEmail()` | ❌ **Absent** | **Ajouter :** `POST /auth/email/verify` avec `{ email, code }`. Sauvegarder les tokens au succès |
| `resendOtp()` | ❌ **Absent** | **Ajouter :** `POST /auth/email/resend` avec `{ email }` |
| `verifyDevice()` | ❌ **Absent** | **Ajouter :** `POST /auth/device/verify` avec `{ email, code, device_id }`. Sauvegarder les tokens au succès |

### `src/shared/store/authStore.ts`
**État :** Partiellement branché.

| Fonction | Problème | Correction |
|---|---|---|
| `fetchMe()` | Le champ `role` peut être une string ou un objet `{ nomRole }` selon le contexte | `role: typeof data.role === 'string' ? data.role : data.role?.nomRole` |
| `logout()` | Appelle `POST /auth/logout` sans envoyer le corps `{ refresh_token }` | **Corriger :** `apiClient.post('/auth/logout', { refresh_token: localStorage.getItem('kwismo_refresh_token') })` |
| Après login | Le `refresh_token` n'est jamais sauvegardé dans `localStorage` | **Corriger :** dans `auth.api.ts`, après réception des tokens : `localStorage.setItem('kwismo_refresh_token', refresh_token)` |

### `src/app/guards/AuthGuard.tsx`
**État :** ✅ Appelle déjà `fetchMe()` et redirige en cas d'échec. Aucun changement nécessaire.

### `src/app/guards/RoleGuard.tsx`
**État :** ✅ Lit `user.role` depuis le store. Fonctionne dès que `fetchMe()` mappe correctement `role.nomRole`. Aucun changement nécessaire.

### Pages UI Auth — flux inscription / vérification
**État :** ❌ Aucune page d'inscription ni de vérification OTP n'existe dans le routeur.

| Action | Fichier |
|---|---|
| Ajouter route `/auth/register` → formulaire d'inscription | `src/app/router.tsx` + nouveau `src/features/auth/components/RegisterForm.tsx` |
| Ajouter route `/auth/verify-email` → saisie du code OTP | `src/app/router.tsx` + nouveau `src/features/auth/components/VerifyEmailForm.tsx` |
| Ajouter route `/auth/verify-device` → OTP nouvel appareil | `src/app/router.tsx` + nouveau `src/features/auth/components/VerifyDeviceForm.tsx` |
| Corriger la réinitialisation : lire `?token=` depuis l'URL | `src/features/auth/components/ResetPasswordForm.tsx` + `src/features/auth/hooks/useResetPassword.ts` |

---

## Vague 2 — Tableau de bord & KPI

### `src/features/dashboard/services/kpi.api.ts`
**État :** ✅ Appelle déjà `GET /kpi/global` et `GET /kpi/partner`. Complet.

### `src/features/dashboard/hooks/useKpi.ts`
**État :** ✅ Appelle `kpi.api.ts`. Vérifier que le mapping `KpiItem[]` → format dashboard est correct (champs : `nomIndicateur`, `valeur`, `periode`).

### `src/features/dashboard/components/TrendChart.tsx`
**État :** ⚠️ Contient des données codées en dur.

| Action | Détail |
|---|---|
| Remplacer les séries codées en dur | Utiliser le résultat de `GET /kpi/global` — mapper `periode` (chaîne mois) en axe X, `valeur` en axe Y |
| Pas d'endpoint de tendance dédié | Construire le graphique à partir du tableau KPI filtré par `nomIndicateur` sur plusieurs mois |

### `src/features/dashboard/components/RecentActivityLog.tsx`
**État :** ⚠️ Semble utiliser des éléments d'activité codés en dur.

| Action | Détail |
|---|---|
| Brancher sur les notifications | Utiliser `GET /notifications` comme fil d'activité. Mapper `texte`, `date`, `lu` |

### `src/features/dashboard/components/FraudByOperatorChart.tsx` & `StatusDistributionChart.tsx`
**État :** Données statiques/codées en dur dans le composant.

| Action | Détail |
|---|---|
| Brancher sur les données de numéros | Utiliser `GET /numbers` — regrouper par `statut` pour StatusDistribution ; par `operatorName` pour FraudByOperator |

---

## Vague 3 — Numéros

### `src/features/numbers/services/numbers.api.ts`
**État :** ✅ Déjà branché. `getNumbers()`, `getNumberById()`, `verifyNumber()`, `updateNumberStatus()` appellent tous les vrais endpoints.

**Vérifier que ces chemins correspondent exactement :**
- `GET /numbers` ✅
- `GET /numbers/{id}` ✅
- `POST /numbers/verify` ✅
- `PATCH /numbers/{id}/status` ✅

### `src/features/numbers/components/NumbersTable.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Supprimer l'import mock | Remplacer `MOCK_NUMBERS` par les données du hook `useNumbers()` |
| Gérer la pagination | Le backend retourne `{ items, total, page, page_size }` — brancher la pagination de la table |

### `src/features/numbers/components/NumberHistoryModal.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Pas d'endpoint historique dédié | Utiliser `GET /numbers/{id}` pour les détails (inclut potentiellement les signalements). Vérifier dans Swagger |
| Alternative | Utiliser `GET /reports` filtré par numéro si le backend supporte ce filtre |

### `src/features/numbers/components/NumberDetailPage.tsx`
**État :** Partiellement branché — appelle l'API pour les données mais certains champs d'affichage peuvent encore avoir un fallback mock.

---

## Vague 4 — Utilisateurs (Admin)

### `src/features/users/services/users.api.ts`
**État :** ✅ Déjà branché. `getUsers()`, `getUserById()`, `updateUserStatus()` appellent tous les vrais endpoints.

### `src/features/users/components/UsersTable.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Remplacer le mock par les données du hook `useUsers()` | Supprimer l'import `MOCK_USERS` |
| Gérer la pagination | Le backend retourne une réponse paginée |

### `src/features/users/components/UserDetailPanel.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Remplacer le mock | Utiliser `getUserById(id)` depuis `users.api.ts` |

### `src/features/users/components/UserDetailPage.tsx`
**État :** Partiellement branché.

| Action | Détail |
|---|---|
| Brancher la mise à jour du statut | `PATCH /users/{id}/status` avec `{ statut: "active" | "suspended" }` |

---

## Vague 5 — Partenaires

### `src/features/partners/services/partners.api.ts`
**État :** ✅ Déjà branché. `getPartners()`, `getPartnerById()`, `createPartner()` appellent les vrais endpoints.

**Fonctions manquantes — à ajouter :**
- `getAffiliationRules(partnerId)` → `GET /partners/{id}/affiliation-rules`
- `createAffiliationRule(partnerId, payload)` → `POST /partners/{id}/affiliation-rules`
- `getPartnerScope()` → `GET /partner/scope/numbers`, `/partner/scope/users`, `/partner/scope/kpi`

### `src/features/partners/components/PartnersTable.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Remplacer `MOCK_PARTNERS` par les données du hook `usePartners()` | Gérer la pagination |

### `src/features/partners/components/PartnerForm.tsx`
**État :** ⚠️ Utilise des données mock (notamment pour les menus déroulants).

| Action | Détail |
|---|---|
| Valeurs de `typePartenariat` | Utiliser des options statiques — pas d'endpoint enum backend. Valeurs : `"bank"`, `"microfinance"`, `"telecom"`, `"other"` |
| Soumission du formulaire | Appeler `createPartner()` depuis `partners.api.ts` |

### `src/features/partners/components/PendingRequestsTable.tsx`
**État :** ⚠️ Utilise des demandes mock codées en dur (depuis `partnerRequestsStore.ts`).

| Action | Détail |
|---|---|
| Pas d'endpoint de liste des demandes | ⚠️ **Manque côté backend** — `POST /partners/request` enregistre les demandes mais il n'existe pas de `GET /partners/requests` pour les lister. Options : (a) demander au dev backend de l'ajouter, ou (b) conserver le store local en attendant |

### `src/features/partners/components/AffiliationRulesEditor.tsx`
**État :** Pas de mock détecté mais probablement aucune vraie donnée encore.

| Action | Détail |
|---|---|
| Brancher sur `GET /partners/{id}/affiliation-rules` | Charger et afficher les règles |
| Brancher le bouton Enregistrer | `POST /partners/{id}/affiliation-rules` |

### `src/features/partners/services/partnerRequestsStore.ts`
**État :** ⚠️ Store en mémoire uniquement (mock pur).

| Action | Détail |
|---|---|
| Remplacer par une vraie API dès que le backend ajoute l'endpoint | En attendant, conserver tel quel et documenter comme manque connu |

---

## Vague 6 — Signalements

### `src/features/reports/services/reports.api.ts`
**État :** ✅ `getReports()` et `validateReport()` appellent les vrais endpoints.

**Manquant — à ajouter :**
- `createReport(payload)` → `POST /reports` avec `{ valeur, motif, categories? }`

### `src/features/reports/components/ReportsView.tsx`
**État :** Partiellement branché — appelle l'API mais a encore un fallback mock.

| Action | Détail |
|---|---|
| Supprimer le fallback mock | Quand `env.useMock=false`, toutes les données viennent de `getReports()` |
| Brancher le bouton Valider | Appeler `validateReport(id, "validated" | "rejected")` |
| Brancher le formulaire de création | Appeler `createReport()` |

---

## Vague 7 — USSD

### `src/features/ussd/services/ussd.api.ts`
**État :** ✅ Appelle `GET /ussd/countries`, `GET /ussd/operators`, `GET /ussd/ussd-actions`.

**Fonctions CRUD manquantes — à ajouter :**
- `POST /ussd/countries` → créer un pays
- `PATCH /ussd/countries/{id}` → modifier
- `DELETE /ussd/countries/{id}` → supprimer
- `POST /ussd/operators` → créer
- `PATCH /ussd/operators/{id}` → modifier
- `DELETE /ussd/operators/{id}` → supprimer
- `POST /ussd/ussd-actions` → créer
- `PATCH /ussd/ussd-actions/{id}` → modifier
- `DELETE /ussd/ussd-actions/{id}` → supprimer

### `src/features/ussd/components/CountriesPanel.tsx`, `OperatorsPanel.tsx`, `UssdActionsPanel.tsx`
**État :** ⚠️ Composants piloté par props — le parent `ussd/index.tsx` leur passe des données mock.

| Action | Détail |
|---|---|
| Brancher `useUssd()` dans le parent | Remplacer `MOCK_COUNTRIES`, `MOCK_OPERATORS`, `MOCK_USSD_ACTIONS` |
| Brancher les boutons Ajouter / Modifier / Supprimer | Utiliser les fonctions CRUD de `ussd.api.ts` |

---

## Vague 8 — Contrôle d'accès

### `src/features/access-control/services/accessControl.api.ts`
**État :** ✅ `getRoles()` et `getPermissions()` appellent les vrais endpoints.

**Manquant — à ajouter :**
- `createRole(payload)` → `POST /access-control/roles`
- `deleteRole(id)` → `DELETE /access-control/roles/{id}`
- `createAccessRight(payload)` → `POST /access-control/access-rights`
- `deleteAccessRight(id)` → `DELETE /access-control/access-rights/{id}`

### `src/features/access-control/services/access.api.ts`
**État :** ❌ Fichier vide. Doublon probable de `accessControl.api.ts`.

| Action | Détail |
|---|---|
| Supprimer ce fichier | Corriger les imports qui pointent vers lui |

### `src/features/access-control/components/RolesList.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Remplacer `MOCK_ROLES` | Appeler `getRoles()` depuis `accessControl.api.ts` |
| Brancher créer / supprimer | Utiliser `createRole()` et `deleteRole()` |

### `src/features/access-control/components/PermissionsMatrix.tsx`
**État :** ⚠️ Utilise des données mock.

| Action | Détail |
|---|---|
| Remplacer `MOCK_PERMISSIONS` | Appeler `getPermissions()` |
| Brancher assigner / révoquer | Utiliser `createAccessRight()` et `deleteAccessRight()` |

---

## Vague 9 — Notifications

### `src/features/notifications/index.tsx`
**État :** ❌ Entièrement codé en dur — 5 objets `NotificationItem` statiques, zéro appel API.

| Action | Détail |
|---|---|
| Créer `notifications.api.ts` | `getNotifications()` → `GET /notifications` |
| Créer un hook `useNotifications()` | Appelle `getNotifications()`, se re-déclenche au focus fenêtre |
| Remplacer la liste codée en dur | Mapper `{ id, texte, date, lu }` du backend vers la forme `NotificationItem` |
| Marquer comme lu | ⚠️ Pas d'endpoint PATCH existant côté backend — à ajouter quand le backend le supportera |

---

## Vague 10 — Profil

### `src/features/profile/index.tsx`
**État :** ❌ Formulaire entièrement codé en dur avec de fausses valeurs par défaut (`'Alice'`, `'Nguesso'`). Lit `user` depuis le store Zustand mais le bouton Enregistrer n'appelle aucune API.

| Action | Détail |
|---|---|
| Pré-remplir depuis le store | `user?.nom`, `user?.prenom`, `user?.email` — partiellement fait |
| Brancher "Enregistrer infos" | `PATCH /users/me` avec `{ nom, prenom, langue }` |
| Brancher "Changer mot de passe" | **Pas d'endpoint dédié** — utiliser le flux oublié/réinitialiser, ou demander au backend d'ajouter `PATCH /users/me/password` |
| Supprimer le champ `telephone` codé en dur | Le modèle `User` backend n'a pas de champ téléphone — il est dans `/users/me/phones` |
| Ajouter une section "Mes numéros" | `GET /users/me/phones` pour afficher les cartes SIM de l'utilisateur |

---

## Vague 11 — Paramètres (SuperAdmin)

### `src/features/settings/services/settings.api.ts`
**État :** ✅ Déjà branché. `getThresholds()` et `updateThresholds()` appellent les vrais endpoints.

### `src/features/settings/index.tsx`
**État :** ✅ Appelle `settings.api.ts`. Peu de travail nécessaire — vérifier que les champs du formulaire correspondent au schéma `SettingsThresholdsOut` dans Swagger.

---

## Vague 12 — Fonctionnalités manquantes (Aucune UI existante)

Ces endpoints backend existent mais n'ont aucune implémentation frontend :

| Fonctionnalité | Endpoint backend | Action |
|---|---|---|
| Mes numéros (SIM) | `GET/POST /users/me/phones` | Créer une nouvelle page ou section (profil ou `/app/mes-numeros`) |
| Vérification OTP des numéros | `POST /users/me/phones/{id}/verify` | Ajouter le flux de vérification après ajout d'un numéro |
| Signaler un numéro compromis | `POST /users/me/phones/{id}/compromise` | Ajouter un bouton dans le détail du numéro |
| Contacts | `GET/POST/DELETE /contacts` | Créer une page contacts (route : `/app/contacts`) |
| Alertes WhatsApp | `POST /whatsapp-alerts/incident` + `/broadcast` | Créer le flux d'alerte dans l'écran incident/compromis |
| Sondages | `GET /surveys/active` + `POST /surveys/{id}/answer` | Créer un widget sondage (modal ou carte barre latérale) |
| Transactions | `POST /transactions/prepare` | Créer l'écran de transfert protégé |
| Appareils | `GET /devices` + `DELETE /devices/{id}` | Ajouter la liste des appareils de confiance dans le profil |
| Catégories d'arnaques | `GET /admin/scam-categories` | Afficher dans le formulaire de signalement comme sélecteur de tags |
| Vérification en lot | `POST /numbers/batch-verify` | Ajouter une action de vérification groupée dans le tableau des numéros |

---

## Manques côté backend (à signaler au dev backend)

| Manque | Impact |
|---|---|
| Pas d'endpoint `GET /partners/requests` | `PendingRequestsTable` ne peut pas être alimentée par de vraies données |
| Pas d'endpoint `PATCH /users/me/password` | Le changement de mot de passe dans le profil n'a nulle part où aller |
| Pas d'endpoint `PATCH /notifications/{id}/read` | Impossible de marquer les notifications comme lues |
| Pas d'endpoint historique de numéro | `NumberHistoryModal` ne peut pas afficher un journal d'événements par numéro |
| `POST /auth/register` existe mais aucune UI d'inscription utilisateur | Flux complet inscription → OTP → connexion absent côté frontend |

---

## Résumé de l'état par fichier

| Fichier | État | Priorité |
|---|---|---|
| `config/env.ts` | ⚠️ Pointe sur localhost par défaut | P0 — corriger `.env` |
| `features/auth/services/auth.api.ts` | ⚠️ Partiel | P0 |
| `shared/store/authStore.ts` | ⚠️ Partiel | P0 |
| `features/dashboard/services/kpi.api.ts` | ✅ Terminé | — |
| `features/dashboard/components/TrendChart.tsx` | ⚠️ Codé en dur | P1 |
| `features/dashboard/components/RecentActivityLog.tsx` | ⚠️ Codé en dur | P1 |
| `features/numbers/services/numbers.api.ts` | ✅ Terminé | — |
| `features/numbers/components/NumbersTable.tsx` | ⚠️ Mock | P1 |
| `features/numbers/components/NumberHistoryModal.tsx` | ⚠️ Mock | P2 |
| `features/users/services/users.api.ts` | ✅ Terminé | — |
| `features/users/components/UsersTable.tsx` | ⚠️ Mock | P1 |
| `features/users/components/UserDetailPanel.tsx` | ⚠️ Mock | P1 |
| `features/partners/services/partners.api.ts` | ✅ Partiel | P1 |
| `features/partners/components/PartnersTable.tsx` | ⚠️ Mock | P1 |
| `features/partners/services/partnerRequestsStore.ts` | ❌ En mémoire | P2 (manque backend) |
| `features/reports/services/reports.api.ts` | ✅ Partiel | P1 |
| `features/reports/components/ReportsView.tsx` | ⚠️ Partiel | P1 |
| `features/ussd/services/ussd.api.ts` | ✅ Lecture seule | P2 (ajouter CRUD) |
| `features/ussd/components/*Panel.tsx` | ⚠️ Mock via parent | P2 |
| `features/access-control/services/accessControl.api.ts` | ✅ Lecture seule | P2 |
| `features/access-control/components/RolesList.tsx` | ⚠️ Mock | P2 |
| `features/access-control/components/PermissionsMatrix.tsx` | ⚠️ Mock | P2 |
| `features/access-control/services/access.api.ts` | ❌ Fichier vide | P3 — à supprimer |
| `features/notifications/index.tsx` | ❌ Entièrement codé en dur | P1 |
| `features/profile/index.tsx` | ❌ Aucun appel API | P1 |
| `features/settings/services/settings.api.ts` | ✅ Terminé | — |
| Page Contacts | ❌ Inexistante | P2 |
| Page Mes Numéros | ❌ Inexistante | P2 |
| Section Appareils (profil) | ❌ Inexistante | P3 |
| Widget Sondages | ❌ Inexistant | P3 |
| Flux Alertes WhatsApp | ❌ Inexistant | P3 |
| Page Transactions | ❌ Inexistante | P3 |

---

## Ordre d'exécution recommandé

```
Vague 1  : Flux d'authentification (inscription, OTP email, vérif appareil, correction logout, sauvegarde tokens)
Vague 2  : Page Profil (PATCH /users/me, liste des appareils)
Vague 3  : Notifications (vraie API)
Vague 4  : Graphiques du tableau de bord (vraies données KPI)
Vague 5  : Tableau des numéros + détail (suppression des mocks)
Vague 6  : Tableau des utilisateurs + détail (suppression des mocks)
Vague 7  : Partenaires (table + détail + règles d'affiliation)
Vague 8  : Signalements (créer + valider)
Vague 9  : USSD CRUD
Vague 10 : Contrôle d'accès CRUD
Vague 11 : Paramètres (vérification uniquement)
Vague 12 : Nouvelles pages — Contacts, Mes Numéros, Transactions, WhatsApp, Sondages
```
