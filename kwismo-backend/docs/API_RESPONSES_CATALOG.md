# KWISMO Backend — Catalogue Général des Reponses et Messages API

Ce document répertorie **l'intégralité des retours HTTP**, structures JSON de réponse, messages de création, de modification, de suppression, de validation et d'erreurs pour l'ensemble des **49+ routes** de l'API KWISMO. Il sert de référence complète (type Swagger/OpenAPI) pour auditer les textes, valider la conformité et vérifier l'ensemble des réponses renvoyées au client web et mobile.

---

## Table des modules API

1. [Authentification & Sécurité (`/auth`)](#1-authentification--sécurité-auth)
2. [Profil Utilisateur & Administration (`/users`)](#2-profil-utilisateur--administration-users)
3. [Raccordement des Téléphones (`/users/me/phones`)](#3-raccordement-des-téléphones-usersmephones)
4. [Carnet de Contacts (`/contacts`)](#4-carnet-de-contacts-contacts)
5. [Appareils Connectés (`/devices`)](#5-appareils-connectés-devices)
6. [Registre de Numéros & Vérification (`/numbers`)](#6-registre-de-numéros--vérification-numbers)
7. [Signalements d'Escroquerie (`/reports`)](#7-signalements-descroquerie-reports)
8. [Transactions & Simulation USSD (`/transactions`)](#8-transactions--simulation-ussd-transactions)
9. [USSD, Opérateurs & Géographie (`/countries`, `/operators`, `/ussd-actions`)](#9-ussd-opérateurs--géographie-countries-operators-ussd-actions)
10. [Partenaires & Affiliation (`/partners`, `/partner/scope`)](#10-partenaires--affiliation-partners-partnerscope)
11. [Alertes Urgence WhatsApp (`/whatsapp-alerts`)](#11-alertes-urgence-whatsapp-whatsapp-alerts)
12. [Enquêtes de Satisfaction (`/surveys`)](#12-enquêtes-de-satisfaction-surveys)
13. [Tableaux de Bord & KPIs (`/kpi`)](#13-tableaux-de-bord--kpis-kpi)
14. [Gestion des Rôles & Droits (`/roles`, `/access-rights`)](#14-gestion-des-rôles--droits-roles-access-rights)
15. [Notifications Utilisateur (`/notifications`)](#15-notifications-utilisateur-notifications)
16. [Passerelle IA & Catégories (`/admin/scam-categories`)](#16-passerelle-ia--catégories-adminscam-categories)
17. [Santé du Système (`/health`)](#17-santé-du-système-health)

---

## 1. Authentification & Sécurité (`/auth`)

### `POST /auth/register` — Inscription d'un nouveau compte
- **Statut** : `201 Created`
- **Scénario 1 : Validation immédiate ou envoi d'OTP email**
```json
{
  "message_fr": "Compte créé. Un code de vérification a été envoyé par email.",
  "message_en": "Account created. A verification code was sent by email."
}
```
- **Scénario 2 : Connexion directe (si email pré-vérifié)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "cmsyslwua0003vlwm8lrfk563",
    "email": "nouveau.compte@kwismo.com",
    "nom": "Kengne",
    "prenom": "Alain",
    "role": "user"
  }
}
```

### `POST /auth/login` — Connexion
- **Statut** : `200 OK`
- **Exemple de retour** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "cmsyslwua0003vlwm8lrfk563",
    "email": "user@kwismo.com",
    "nom": "User",
    "prenom": "Test",
    "role": "user"
  }
}
```
- **Si l'appareil n'est pas reconnu (Vérification Device requis)** : `200 OK` avec `DeviceVerificationRequiredOut`
```json
{
  "device_verification_required": true,
  "message_fr": "Un code de vérification a été envoyé pour valider cet appareil.",
  "message_en": "A verification code was sent to validate this device."
}
```
- **Erreurs possibles** : `401 Unauthorized`
```json
{
  "detail": "Email ou mot de passe incorrect."
}
```

### `POST /auth/email/verify` — Validation du code OTP Email
- **Statut** : `200 OK`
- **Message renvoyé** :
```json
{
  "message_fr": "Email vérifié avec succès.",
  "message_en": "Email verified successfully."
}
```

### `POST /auth/email/resend` — Renvoyer l'OTP Email
- **Statut** : `200 OK`
```json
{
  "message_fr": "Nouveau code envoyé par email.",
  "message_en": "New code sent by email."
}
```

### `POST /auth/refresh` — Rafraîchissement du jeton JWT
- **Statut** : `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

### `POST /auth/password/forgot` — Demande de réinitialisation du mot de passe
- **Statut** : `200 OK`
```json
{
  "message_fr": "Un code de réinitialisation a été envoyé par email.",
  "message_en": "A reset code was sent by email."
}
```

### `POST /auth/password/reset` — Validation de la réinitialisation
- **Statut** : `200 OK`
```json
{
  "message_fr": "Mot de passe réinitialisé avec succès.",
  "message_en": "Password reset successfully."
}
```

### `POST /auth/logout` — Déconnexion
- **Statut** : `200 OK`
```json
{
  "message_fr": "Déconnexion réussie.",
  "message_en": "Logged out successfully."
}
```

---

## 2. Profil Utilisateur & Administration (`/users`)

### `GET /users/me` — Consultation du profil connecté
- **Statut** : `200 OK`
```json
{
  "id": "cmsyslwua0003vlwm8lrfk563",
  "nom": "User",
  "prenom": "Test",
  "email": "user@kwismo.com",
  "email_verifie": true,
  "statut": "active",
  "langue": "fr",
  "date_inscription": "2026-08-19T06:00:00Z",
  "role": "user"
}
```

### `PATCH /users/me` — Modification de mon profil
- **Statut** : `200 OK`
```json
{
  "id": "cmsyslwua0003vlwm8lrfk563",
  "nom": "NouveauNom",
  "prenom": "NouveauPrenom",
  "email": "user@kwismo.com",
  "email_verifie": true,
  "statut": "active",
  "langue": "en"
}
```

### `GET /users` — Liste paginée des utilisateurs (Admin / Partner)
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsysu4j8000t5wd78t6ej3gn",
      "nom": "Douala",
      "prenom": "Paul",
      "email": "user2@kwismo.com",
      "statut": "active",
      "role": "user",
      "telephones_count": 1,
      "date_inscription": "2026-08-19T06:00:00Z"
    }
  ],
  "total": 4,
  "page": 1,
  "page_size": 20
}
```

### `PATCH /users/{id}/status` — Suspension ou réactivation d'un utilisateur (Admin)
- **Statut** : `200 OK`
```json
{
  "id": "cmsysu4j8000t5wd78t6ej3gn",
  "nom": "Douala",
  "prenom": "Paul",
  "email": "user2@kwismo.com",
  "statut": "suspended"
}
```

---

## 3. Raccordement des Téléphones (`/users/me/phones`)

### `GET /users/me/phones` — Liste de mes numéros de téléphone
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsysvmv1003hytq2tnxjycxx",
    "valeur": "+237670000001",
    "country_id": "cmsyju7x40003icdy",
    "operator_id": "cmsysr5aq004mshwvqd4wppll",
    "est_verifie": true,
    "est_compromis": false,
    "created_at": "2026-08-19T06:00:00Z"
  }
]
```

### `POST /users/me/phones` — Ajout d'un numéro de téléphone
- **Statut** : `201 Created`
```json
{
  "id": "cmsztr4ck003hoqoettei3tfe",
  "valeur": "+237677083373",
  "country_id": "cmsyju7x40003icdy",
  "operator_id": "cmsysr5aq004mshwvqd4wppll",
  "est_verifie": false,
  "est_compromis": false,
  "created_at": "2026-08-19T09:23:25Z"
}
```

### `POST /users/me/phones/{id}/verify` — Vérification du numéro via OTP SMS
- **Statut** : `200 OK`
```json
{
  "id": "cmsztr4ck003hoqoettei3tfe",
  "valeur": "+237677083373",
  "est_verifie": true
}
```

### `DELETE /users/me/phones/{id}` — Suppression d'un numéro du compte
- **Statut** : `200 OK`
```json
{
  "message_fr": "Numéro retiré du compte.",
  "message_en": "Number removed from account."
}
```

### `POST /users/me/phones/{id}/compromise` — Déclarer un numéro compromis (SIM Swap)
- **Statut** : `201 Created` ou `409 Conflict` (si déjà compromis)
```json
{
  "id": "inc_9901",
  "compromise_incident_id": "inc_9901",
  "user_phone_id": "cmsysvmv1003hytq2tnxjycxx",
  "numero": "+237670000001",
  "statut": "open"
}
```

---

## 4. Carnet de Contacts (`/contacts`)

### `GET /contacts` — Liste des contacts avec insigne de réputation
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsysw7fo003e7jjy4zwyuxi0",
    "nom": "Maman",
    "numero": "+237677889900",
    "statut": "securise",
    "created_at": "2026-08-19T06:00:00Z"
  }
]
```

### `POST /contacts` — Ajout d'un contact
- **Statut** : `201 Created`
```json
{
  "id": "cmsztr4eg003loqoehlnjnjx3",
  "nom": "Contact Test Auto",
  "numero": "+237672226036",
  "statut": "securise",
  "created_at": "2026-08-19T09:23:25Z"
}
```

### `POST /contacts/{id}/refresh` — Rafraîchissement de l'insigne
- **Statut** : `200 OK`
```json
{
  "id": "cmsztr4eg003loqoehlnjnjx3",
  "nom": "Contact Test Auto",
  "numero": "+237672226036",
  "statut": "frauduleux",
  "created_at": "2026-08-19T09:23:25Z"
}
```

### `DELETE /contacts/{id}` — Suppression d'un contact
- **Statut** : `200 OK`
```json
{
  "message_fr": "Contact supprimé.",
  "message_en": "Contact deleted."
}
```

---

## 5. Appareils Connectés (`/devices`)

### `GET /devices` — Liste des appareils autorisés
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsysw7ei003c7jjyeltf3c86",
    "identifiant": "android_device_user_1",
    "nom": "Audit Terminal",
    "date_premiere_connexion": "2026-08-19T06:00:00Z",
    "date_derniere_connexion": "2026-08-19T09:23:25Z"
  }
]
```

---

## 6. Registre de Numéros & Vérification (`/numbers`)

### `POST /numbers/verify` — Vérification unitaire d'un numéro
- **Statut** : `200 OK`
```json
{
  "id": "cmsysvmtt003fytq2dh5rfnra",
  "valeur": "+237670999888",
  "score_risque": 0.85,
  "statut": "frauduleux",
  "nombre_signalements": 8,
  "nombre_verifications": 15,
  "categories_arnaque": ["fake_agent_otp"]
}
```

### `POST /numbers/batch-verify` — Vérification par lot (carnet d'adresses)
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsysulq50000laffaeyp1zo5",
    "valeur": "+237670000001",
    "score_risque": 0.1,
    "statut": "securise"
  },
  {
    "id": "cmsysvmtt003fytq2dh5rfnra",
    "valeur": "+237670999888",
    "score_risque": 0.85,
    "statut": "frauduleux"
  }
]
```

### `GET /numbers` — Registre global des numéros (Admin / Partner)
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsysvmsh003dytq2lj4qyoi0",
      "valeur": "+237677889900",
      "score_risque": 0.7,
      "statut": "frauduleux",
      "date_mise_a_jour": "2026-08-19T09:24:41Z"
    }
  ],
  "total": 6,
  "page": 1,
  "page_size": 20
}
```

### `PATCH /numbers/{id}/status` — Mise à jour manuelle du statut (Admin)
- **Statut** : `200 OK`
```json
{
  "id": "cmsysvmsh003dytq2lj4qyoi0",
  "valeur": "+237677889900",
  "score_risque": 0.9,
  "statut": "frauduleux"
}
```

---

## 7. Signalements d'Escroquerie (`/reports`)

### `POST /reports` — Soumettre un signalement
- **Statut** : `201 Created`
```json
{
  "id": "cmsztrubk003noqoetgu26t49",
  "user_id": "cmsyslwua0003vlwm8lrfk563",
  "numero_id": "cmsysvmtt003fytq2dh5rfnra",
  "valeur_numero": "+237677889900",
  "motif": "Spam SMS répétitif",
  "statut": "pending",
  "created_at": "2026-08-19T09:24:16Z"
}
```

### `GET /reports` — Consulter les signalements
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsztrubk003noqoetgu26t49",
      "valeur_numero": "+237677889900",
      "motif": "Spam SMS répétitif",
      "statut": "pending",
      "created_at": "2026-08-19T09:24:16Z"
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20
}
```

### `PATCH /reports/{id}/validate` — Validation / Rejet par un administrateur
- **Statut** : `200 OK`
```json
{
  "id": "cmsztrubk003noqoetgu26t49",
  "statut": "validated",
  "valeur_numero": "+237677889900",
  "validated_at": "2026-08-19T09:24:41Z"
}
```

---

## 8. Transactions & Simulation USSD (`/transactions`)

### `POST /transactions/prepare` — Préparer un transfert et générer le code USSD
- **Statut** : `200 OK` (ou `403 Forbidden` si le numéro destinataire est bloqué)
```json
{
  "id": "cmsztsq4l003roqoessgi1gw5",
  "numero_id": "cmsysulq50000laffaeyp1zo5",
  "valeur_numero": "+237670000001",
  "montant": 1500.0,
  "niveau_risque": "low",
  "code_ussd_genere": "*126*1500*670000001#",
  "statut": "prepared"
}
```

### `GET /transactions` — Historique de mes transactions
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsztsq4l003roqoessgi1gw5",
      "montant": 1500.0,
      "statut": "prepared",
      "niveau_risque": "low",
      "date_transaction": "2026-08-19T09:24:40Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

## 9. USSD, Opérateurs & Géographie (`/countries`, `/operators`, `/ussd-actions`)

### `GET /countries` — Liste des pays pris en charge
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsysr3qp000bshwvwv2nyrrj",
    "nom": "Cameroun",
    "code_pays": "+237",
    "est_par_defaut": true
  }
]
```

### `POST /countries` — Ajouter un pays (Admin)
- **Statut** : `201 Created`
```json
{
  "id": "cnt_1099",
  "nom": "Gabon",
  "code_pays": "+241",
  "est_par_defaut": false
}
```

### `DELETE /countries/{id}` — Supprimer un pays (Admin)
- **Statut** : `200 OK`
```json
{
  "message_fr": "Pays supprimé.",
  "message_en": "Country deleted."
}
```

---

## 10. Partenaires & Affiliation (`/partners`, `/partner/scope`)

### `GET /partners` — Liste des partenaires d'affaires (Admin)
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsysu4fk000r5wd7napvsy51",
      "nom_entreprise": "MTN Mobile Money SAM",
      "type_partenariat": "Operator",
      "date_adhesion": "2026-08-19T06:00:00Z"
    }
  ],
  "total": 2
}
```

### `GET /partner/scope/kpi` — Métriques exclusives du partenaire connecté
- **Statut** : `200 OK`
```json
[
  {
    "nom_indicateur": "partenaire_transactions",
    "valeur": 850.0,
    "periode": "2026-08"
  }
]
```

---

## 11. Alertes Urgence WhatsApp (`/whatsapp-alerts`)

### `POST /whatsapp-alerts/incident` — Déclarer un piratage de compte
- **Statut** : `201 Created`
```json
{
  "id": "cmszmlyds003za68336wc76ya",
  "compromise_incident_id": "cmszmlyds003za68336wc76ya",
  "user_phone_id": "cmsysvmv1003hytq2tnxjycxx",
  "numero": "+237670000001",
  "statut": "open"
}
```

### `POST /whatsapp-alerts/broadcast` — Diffuser l'alerte à son carnet de contacts
- **Statut** : `200 OK`
```json
{
  "id": "alert_4401",
  "contenu": "ALERTE KWISMO — Mon compte WhatsApp (+237670000001) a été piraté.",
  "recipients": [
    {
      "contact_id": "cmsysw7fo003e7jjy4zwyuxi0",
      "statut_accuse": "envoye"
    }
  ]
}
```

---

## 12. Enquêtes de Satisfaction (`/surveys`)

### `GET /surveys/active` — Récupérer l'enquête active
- **Statut** : `200 OK`
```json
[
  {
    "id": "survey_101",
    "question": "Comment évaluez-vous la précision des alertes anti-escroquerie KWISMO ?",
    "actif": true,
    "date_creation": "2026-08-19T10:39:00Z"
  }
]
```

### `POST /surveys/{id}/answer` — Soumettre une réponse
- **Statut** : `200 OK`
```json
{
  "id": "ans_8801",
  "survey_id": "survey_101",
  "reponse": "Très satisfait",
  "date_reponse": "2026-08-19T10:39:05Z"
}
```

---

## 13. Tableaux de Bord & KPIs (`/kpi`)

### `GET /kpi/global` — Indicateurs globaux (Admin)
- **Statut** : `200 OK`
```json
[
  {
    "id": "cmsyswx6w003po9qrdhp5bh6a",
    "nom_indicateur": "signalements_mensuels",
    "valeur": 1240.0,
    "periode": "2026-08"
  },
  {
    "id": "cmsyswx75003qo9qr1x6x3t4y",
    "nom_indicateur": "taux_resolution",
    "valeur": 94.5,
    "periode": "2026-08"
  }
]
```

---

## 14. Gestion des Rôles & Droits (`/roles`, `/access-rights`)

### `GET /roles` — Liste des rôles système (Admin)
- **Statut** : `200 OK`
```json
[
  { "id": "cmsyju7ww0002icdy66jnbyqa", "nom_role": "admin" },
  { "id": "cmsyju7wn0001icdyf9ktv70l", "nom_role": "partner" },
  { "id": "cmsyju7wa0000icdyjw9azk4t", "nom_role": "user" }
]
```

---

## 15. Notifications Utilisateur (`/notifications`)

### `GET /notifications` — Notifications utilisateur
- **Statut** : `200 OK`
```json
{
  "items": [
    {
      "id": "cmsztp3o50069l94ljk8ccsrz",
      "texte": "Votre signalement a été validé par nos équipes.",
      "lu": false,
      "date": "2026-08-19T09:24:40Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

## 16. Passerelle IA & Catégories (`/admin/scam-categories`)

### `GET /admin/scam-categories` — Catégories d'arnaques découvertes par l'IA
- **Statut** : `200 OK`
```json
[
  {
    "id": "scam_cat_1",
    "nom_code": "fake_agent_otp",
    "libelle": "Faux agent télécom (Demande OTP)",
    "description": "Appelant se faisant passer pour le support de l'opérateur"
  }
]
```

---

## 17. Santé du Système (`/health`)

### `GET /health` — Vérification de l'état de l'API
- **Statut** : `200 OK`
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected"
}
```
