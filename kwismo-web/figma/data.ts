/* ═══════════════════════════════════════════════════════════════════════════
   KWISMO — Source de données & design tokens
   Palette officielle : Vert #56B039 · Orange #F6A020 · Bleu #4D6AB1
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  Users, Database, AlertTriangle, ShieldCheck, Shield, Server, Hash,
  Activity, TrendingUp, Lock, PhoneOff, UserCheck, MessageCircle,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   1. JETONS DE COULEUR — nouvelle palette
─────────────────────────────────────────────────────────────────────────── */
export const BLUE = "#4D6AB1";
export const ORANGE = "#F6A020";
export const GREEN = "#56B039";
export const RED = "#E4483B";

/** Variantes thème sombre (éclaircies pour rester lisibles) */
export const BLUE_DARK = "#7B93D4";
export const ORANGE_DARK = "#FFB84D";
export const GREEN_DARK = "#6FC957";
export const RED_DARK = "#FF6155";

/** Couleurs auxiliaires pour les rôles et catégories */
export const PURPLE = "#7C3AED";
export const CYAN = "#0891B2";
export const INDIGO = "#4F46E5";
export const PINK = "#DB2777";

/** Palette proposée à la création d'un rôle */
export const ROLE_COLORS = [BLUE, PURPLE, CYAN, ORANGE, GREEN, INDIGO, PINK, RED];

/* ───────────────────────────────────────────────────────────────────────────
   2. TYPES DE NAVIGATION
─────────────────────────────────────────────────────────────────────────── */
export type Lang = "fr" | "en";
export type View = "landing" | "login" | "forgot" | "setpwd" | "admin" | "partner" | "user";

export type AdminSection =
  | "dashboard" | "users" | "partners" | "numbers"
  | "countries" | "access" | "reports" | "profile" | "notifications";

export type PartnerSection =
  | "dashboard" | "numbers" | "users" | "reports" | "profile" | "notifications";

/** Sections de l'espace utilisateur (§9 mobile — substitut web de secours) */
export type UserSection =
  | "home" | "numbers" | "compromised" | "verify" | "report" | "profile" | "notifications";

/** Mode d'une page formulaire : lecture seule, édition inline, création */
export type FormMode = "view" | "edit" | "create";

/** États de données normatifs (§1.2 « Convention de lecture ») */
export type DataState = "loading" | "empty" | "error" | "success";

/* ───────────────────────────────────────────────────────────────────────────
   3. TYPES MÉTIER
─────────────────────────────────────────────────────────────────────────── */
export type NumberOwnerStatus = "Vérifié" | "En attente" | "Compromis";
export type NumberRiskStatus = "Sécurisé" | "À signaler" | "Frauduleux";
export type AccountStatus = "Actif" | "Suspendu" | "Inactif";
export type PartnerStatus = "Actif" | "Suspendu";
export type PartnerType = "Opérateur" | "Fintech" | "Banque" | "Régulateur";

/** Numéro rattaché à un compte utilisateur (multi-SIM) */
export interface UserNumber {
  id: number;
  num: string;
  op: string;
  pays: string;
  indicatif: string;
  statut: NumberOwnerStatus;
  verif: string;
}

/** Compte KWISMO — identifié par email, peut porter plusieurs numéros */
export interface AppUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  emailVerifie: boolean;
  statut: AccountStatus;
  role: string;
  date: string;
  numeros: UserNumber[];
}

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  pays: string;
  statut: PartnerStatus;
  date: string;
  contact: string;
  email: string;
  phone: string;
  numeros: number;
}

export interface PhoneNumber {
  id: number;
  num: string;
  op: string;
  pays: string;
  score: number;
  statut: NumberRiskStatus;
  partenaire: string;
  compte: string | null;
  verif: string;
}

export interface AffiliationRule {
  id: number;
  partenaire: string;
  pays: string;
  prefixes: string[];
  numerosConcernes: number;
  actif: boolean;
}

export interface UssdAction {
  id: number;
  label: string;
  code: string;
}

export interface Operator {
  id: number;
  nom: string;
  prefixes: string[];
  ussd: UssdAction[];
}

export interface Country {
  id: number;
  pays: string;
  code: string;
  indicatif: string;
  isDefault: boolean;
  operateurs: Operator[];
}

export interface Role {
  id: number;
  role: string;
  desc: string;
  color: string;
  systeme: boolean;
  count: number;
  perms: Record<string, Record<string, boolean>>;
}

export interface Notification {
  id: number;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

/** Contact du compte utilisateur — cible des alertes (§9.5 mobile) */
export interface Contact {
  id: number;
  nom: string;
  num: string;
  statut: NumberRiskStatus | "Inconnu";
}

/* ───────────────────────────────────────────────────────────────────────────
   4. TRADUCTIONS
─────────────────────────────────────────────────────────────────────────── */
export const T = {
  fr: {
    nav: { features: "Fonctionnalités", how: "Fonctionnement", pricing: "Tarifs", partners: "Partenaires", admin: "Se connecter" },
    hero: {
      badge: "Protection anti-fraude Mobile Money",
      h1a: "Protégez chaque transaction contre", h1b: "la fraude",
      sub: "KWISMO analyse en temps réel les appels, transferts et contacts Mobile Money pour protéger des millions d'utilisateurs en Afrique.",
      cta1: "Télécharger l'app", cta2: "Devenir partenaire",
    },
    stats: ["Numéros vérifiés", "Précision", "Opérateurs"],
    partnerForm: { title: "Devenir partenaire KWISMO", name: "Nom de l'entreprise", type: "Type de partenariat", country: "Pays", contact: "Nom du contact", email: "Email professionnel", phone: "Téléphone", msg: "Message (optionnel)", send: "Envoyer la demande", success: "Demande envoyée !", successSub: "Notre équipe vous contactera sous 48h." },
    contactForm: { title: "Contacter l'équipe", name: "Votre nom", email: "Votre email", subject: "Sujet", msg: "Message", send: "Envoyer le message", success: "Message envoyé !", successSub: "Nous vous répondrons rapidement." },
    footer: { dl: "Téléchargement", about: "À propos", legal: "Légal", copy: "© 2026 KWISMO. Tous droits réservés." },
    dl: { apple: "Télécharger sur", google: "Disponible sur" },
    login: { title: "Connexion", sub: "Accédez à votre espace sécurisé", email: "Adresse email", pass: "Mot de passe", forgot: "Mot de passe oublié ?", submit: "Se connecter", loading: "Connexion…", error: "Identifiants incorrects." },
    forgot: { title: "Mot de passe oublié", sub: "Entrez votre email pour recevoir un lien de réinitialisation.", email: "Adresse email", submit: "Envoyer le lien", sent: "Un email de réinitialisation a été envoyé." },
    setpwd: { title: "Nouveau mot de passe", sub: "Choisissez un mot de passe sécurisé.", pass: "Nouveau mot de passe", confirm: "Confirmer", submit: "Enregistrer", done: "Mot de passe modifié avec succès !" },
    states: {
      loading: "Chargement en cours…",
      empty: "Aucune donnée à afficher",
      emptySub: "Aucun élément ne correspond à votre recherche.",
      error: "Une erreur est survenue",
      retry: "Réessayer",
    },
  },
  en: {
    nav: { features: "Features", how: "How it works", pricing: "Pricing", partners: "Partners", admin: "Login" },
    hero: {
      badge: "Mobile Money anti-fraud protection",
      h1a: "Protect every transaction against", h1b: "fraud",
      sub: "KWISMO analyzes calls, transfers and Mobile Money contacts in real time to protect millions of users across Africa.",
      cta1: "Download the app", cta2: "Become a partner",
    },
    stats: ["Numbers verified", "Accuracy", "Operators"],
    partnerForm: { title: "Become a KWISMO partner", name: "Company name", type: "Partnership type", country: "Country", contact: "Contact name", email: "Professional email", phone: "Phone", msg: "Message (optional)", send: "Send request", success: "Request sent!", successSub: "Our team will contact you within 48h." },
    contactForm: { title: "Contact the team", name: "Your name", email: "Your email", subject: "Subject", msg: "Message", send: "Send message", success: "Message sent!", successSub: "We will get back to you shortly." },
    footer: { dl: "Download", about: "About", legal: "Legal", copy: "© 2026 KWISMO. All rights reserved." },
    dl: { apple: "Download on the", google: "Get it on" },
    login: { title: "Sign in", sub: "Access your secure workspace", email: "Email address", pass: "Password", forgot: "Forgot password?", submit: "Sign in", loading: "Signing in…", error: "Invalid credentials." },
    forgot: { title: "Forgot password", sub: "Enter your email to receive a reset link.", email: "Email address", submit: "Send link", sent: "A reset email has been sent." },
    setpwd: { title: "New password", sub: "Choose a secure password.", pass: "New password", confirm: "Confirm", submit: "Save", done: "Password changed successfully!" },
    states: {
      loading: "Loading…",
      empty: "No data to display",
      emptySub: "No item matches your search.",
      error: "An error occurred",
      retry: "Retry",
    },
  },
} as const;

/* ───────────────────────────────────────────────────────────────────────────
   5. DONNÉES DE GRAPHIQUES
─────────────────────────────────────────────────────────────────────────── */
export const mkSpark = (b: number, d: number) =>
  Array.from({ length: 8 }, (_, i) => ({ v: b + d * i + Math.sin(i * 1.5) * b * 0.05 }));

export const weeklyAll = [
  { w: "S1", sig: 1240, fra: 310 }, { w: "S2", sig: 1380, fra: 345 },
  { w: "S3", sig: 1520, fra: 380 }, { w: "S4", sig: 1650, fra: 412 },
  { w: "S5", sig: 1480, fra: 370 }, { w: "S6", sig: 1720, fra: 430 },
  { w: "S7", sig: 1890, fra: 472 }, { w: "S8", sig: 2010, fra: 502 },
  { w: "S9", sig: 1950, fra: 487 }, { w: "S10", sig: 2140, fra: 535 },
  { w: "S11", sig: 2380, fra: 594 }, { w: "S12", sig: 2510, fra: 627 },
];

export const opData = [
  { op: "MTN", n: 892, fraudes: 214 },
  { op: "Orange", n: 654, fraudes: 168 },
  { op: "Airtel", n: 423, fraudes: 97 },
  { op: "M-Pesa", n: 312, fraudes: 61 },
  { op: "Moov", n: 187, fraudes: 43 },
  { op: "Wave", n: 156, fraudes: 38 },
];

export const statutsData = [
  { name: "Sécurisé", value: 68420, color: GREEN },
  { name: "À signaler", value: 12340, color: ORANGE },
  { name: "Frauduleux", value: 3241, color: RED },
];

export const PERIODS = ["7 jours", "30 jours", "90 jours", "Cette année"] as const;
export type Period = typeof PERIODS[number];

/* ───────────────────────────────────────────────────────────────────────────
   6. CARTES KPI
─────────────────────────────────────────────────────────────────────────── */
export const kpiCards = [
  { label: "Utilisateurs actifs", value: "128 432", change: "+12,4 %", up: true, icon: Users, color: BLUE, spark: mkSpark(100, 3) },
  { label: "Numéros vérifiés", value: "2 418 901", change: "+8,7 %", up: true, icon: Database, color: GREEN, spark: mkSpark(80, 4) },
  { label: "Signalements", value: "14 873", change: "+23,1 %", up: true, icon: AlertTriangle, color: ORANGE, spark: mkSpark(60, 8) },
  { label: "Fraudes détectées", value: "3 241", change: "+5,6 %", up: false, icon: ShieldCheck, color: RED, spark: mkSpark(80, 2) },
  { label: "Transactions protégées", value: "892 417", change: "+18,2 %", up: true, icon: Shield, color: GREEN, spark: mkSpark(70, 5) },
  { label: "Appels API partenaires", value: "4,1M", change: "+31,5 %", up: true, icon: Server, color: BLUE, spark: mkSpark(50, 9) },
];

export const partnerKpis = [
  { label: "Numéros surveillés", value: "28 430", change: "+4,2 %", up: true, icon: Hash, color: BLUE, spark: mkSpark(80, 2) },
  { label: "Fraudes évitées", value: "1 204", change: "+18,7 %", up: true, icon: ShieldCheck, color: GREEN, spark: mkSpark(60, 5) },
  { label: "Signalements reçus", value: "3 812", change: "+9,3 %", up: true, icon: AlertTriangle, color: ORANGE, spark: mkSpark(50, 4) },
  { label: "Appels API (mois)", value: "94 200", change: "+31,5 %", up: true, icon: Server, color: BLUE, spark: mkSpark(40, 8) },
  { label: "Coût estimé (USD)", value: "94,20 $", change: "+31,5 %", up: false, icon: Activity, color: ORANGE, spark: mkSpark(30, 7) },
  { label: "Score moyen", value: "87 / 100", change: "+2,1 %", up: true, icon: TrendingUp, color: GREEN, spark: mkSpark(80, 1) },
];

/** KPI de l'espace utilisateur (§9.1 mobile) */
export const userKpis = [
  { label: "Numéros vérifiés", value: "3", change: "+1", up: true, icon: ShieldCheck, color: GREEN, spark: mkSpark(10, 1) },
  { label: "Menaces évitées", value: "12", change: "+3", up: true, icon: Shield, color: BLUE, spark: mkSpark(8, 1) },
  { label: "Signalements effectués", value: "5", change: "+2", up: true, icon: AlertTriangle, color: ORANGE, spark: mkSpark(6, 1) },
  { label: "Transferts protégés", value: "28", change: "+7", up: true, icon: TrendingUp, color: GREEN, spark: mkSpark(14, 2) },
];

/* ───────────────────────────────────────────────────────────────────────────
   7. UTILISATEURS — compte + numéros rattachés
─────────────────────────────────────────────────────────────────────────── */
export const allUsers: AppUser[] = [
  {
    id: 1, nom: "Nguesso", prenom: "Alice", email: "alice.nguesso@kwismo.com",
    emailVerifie: true, statut: "Actif", role: "Admin", date: "02/01/2025",
    numeros: [
      { id: 101, num: "+237 691 234 567", op: "MTN", pays: "Cameroun", indicatif: "+237", statut: "Vérifié", verif: "02/01/2025" },
      { id: 102, num: "+237 655 987 654", op: "Orange", pays: "Cameroun", indicatif: "+237", statut: "Vérifié", verif: "18/03/2025" },
    ],
  },
  {
    id: 2, nom: "Sow", prenom: "Ibrahima", email: "i.sow@orange.sn",
    emailVerifie: true, statut: "Actif", role: "Partenaire", date: "14/02/2025",
    numeros: [
      { id: 103, num: "+221 77 891 23 45", op: "Orange", pays: "Sénégal", indicatif: "+221", statut: "Vérifié", verif: "14/02/2025" },
      { id: 104, num: "+221 70 445 88 12", op: "Wave", pays: "Sénégal", indicatif: "+221", statut: "En attente", verif: "—" },
      { id: 105, num: "+221 76 112 34 56", op: "Free", pays: "Sénégal", indicatif: "+221", statut: "Vérifié", verif: "22/05/2025" },
    ],
  },
  {
    id: 3, nom: "Mbeki", prenom: "Jean", email: "jean.mbeki@kwismo.com",
    emailVerifie: true, statut: "Suspendu", role: "Admin", date: "15/01/2025",
    numeros: [
      { id: 106, num: "+237 690 123 456", op: "MTN", pays: "Cameroun", indicatif: "+237", statut: "Compromis", verif: "10/07/2026" },
    ],
  },
  {
    id: 4, nom: "Asante", prenom: "Kwame", email: "k.asante@mtn.gh",
    emailVerifie: true, statut: "Actif", role: "Partenaire", date: "08/06/2025",
    numeros: [
      { id: 107, num: "+233 20 987 65 43", op: "MTN", pays: "Ghana", indicatif: "+233", statut: "Vérifié", verif: "08/06/2025" },
      { id: 108, num: "+233 24 456 78 90", op: "Airtel", pays: "Ghana", indicatif: "+233", statut: "Vérifié", verif: "12/06/2025" },
    ],
  },
  {
    id: 5, nom: "Adeyemi", prenom: "Ngozi", email: "ngozi.adeyemi@gmail.com",
    emailVerifie: false, statut: "Inactif", role: "Analyste", date: "30/04/2025",
    numeros: [
      { id: 109, num: "+234 80 1234 5678", op: "MTN", pays: "Nigéria", indicatif: "+234", statut: "En attente", verif: "—" },
    ],
  },
  {
    id: 6, nom: "Ben Salah", prenom: "Aïcha", email: "aicha.bensalah@ooredoo.tn",
    emailVerifie: true, statut: "Actif", role: "Partenaire", date: "03/07/2025",
    numeros: [
      { id: 110, num: "+216 20 456 789", op: "Ooredoo", pays: "Tunisie", indicatif: "+216", statut: "Vérifié", verif: "03/07/2025" },
    ],
  },
  {
    id: 7, nom: "Diarra", prenom: "Moussa", email: "m.diarra@kwismo.com",
    emailVerifie: true, statut: "Actif", role: "Support", date: "10/07/2025",
    numeros: [
      { id: 111, num: "+223 76 543 210", op: "Orange", pays: "Mali", indicatif: "+223", statut: "Vérifié", verif: "10/07/2025" },
      { id: 112, num: "+223 65 221 908", op: "Moov", pays: "Mali", indicatif: "+223", statut: "Vérifié", verif: "15/07/2025" },
    ],
  },
  {
    id: 8, nom: "Ouédraogo", prenom: "Fatimata", email: "f.ouedraogo@kwismo.com",
    emailVerifie: true, statut: "Actif", role: "Analyste", date: "19/07/2025",
    numeros: [
      { id: 113, num: "+226 70 123 456", op: "Moov", pays: "Burkina Faso", indicatif: "+226", statut: "Vérifié", verif: "19/07/2025" },
    ],
  },
  {
    id: 9, nom: "Kouyaté", prenom: "Diallo", email: "dkouyate@mtn.com",
    emailVerifie: true, statut: "Actif", role: "Partenaire", date: "15/01/2023",
    numeros: [
      { id: 114, num: "+237 699 123 456", op: "MTN", pays: "Cameroun", indicatif: "+237", statut: "Vérifié", verif: "15/01/2023" },
    ],
  },
  {
    id: 10, nom: "Yao", prenom: "Paul", email: "pyao@sgci.com",
    emailVerifie: false, statut: "Actif", role: "Partenaire", date: "11/09/2023",
    numeros: [
      { id: 115, num: "+225 07 45 678 901", op: "Orange", pays: "Côte d'Ivoire", indicatif: "+225", statut: "Compromis", verif: "20/07/2026" },
    ],
  },
];

export const USER_ROLES = ["Admin", "Partenaire", "Analyste", "Support"];
export const ACCOUNT_STATUSES: AccountStatus[] = ["Actif", "Suspendu", "Inactif"];

export const pendingInvites = [
  { id: 1, email: "nouveau@kwismo.com", role: "Analyste", by: "Alice Nguesso", date: "15/07/2026" },
  { id: 2, email: "support@mtn.cm", role: "Support", by: "Jean Mbeki", date: "18/07/2026" },
];

/* ───────────────────────────────────────────────────────────────────────────
   8. COMPTE UTILISATEUR CONNECTÉ (espace de secours web)
   Un compte, plusieurs numéros. L'identité est l'email.
─────────────────────────────────────────────────────────────────────────── */
export const currentUser: AppUser = {
  id: 1000, nom: "Talla", prenom: "Bernard", email: "bernard.talla@gmail.com",
  emailVerifie: true, statut: "Actif", role: "Utilisateur", date: "12/03/2025",
  numeros: [
    { id: 2001, num: "+237 691 456 789", op: "MTN", pays: "Cameroun", indicatif: "+237", statut: "Vérifié", verif: "12/03/2025" },
    { id: 2002, num: "+237 655 112 233", op: "Orange", pays: "Cameroun", indicatif: "+237", statut: "Vérifié", verif: "20/04/2025" },
    { id: 2003, num: "+237 680 998 877", op: "Camtel", pays: "Cameroun", indicatif: "+237", statut: "En attente", verif: "—" },
  ],
};

/** Contacts du compte — cibles possibles d'une alerte de compromission (§9.5) */
export const userContacts: Contact[] = [
  { id: 1, nom: "Marie Talla", num: "+237 690 111 222", statut: "Sécurisé" },
  { id: 2, nom: "Paul Nkeng", num: "+237 677 333 444", statut: "Sécurisé" },
  { id: 3, nom: "Grace Fon", num: "+237 655 555 666", statut: "À signaler" },
  { id: 4, nom: "Samuel Eto", num: "+237 699 777 888", statut: "Sécurisé" },
  { id: 5, nom: "Aïssatou Bah", num: "+237 681 999 000", statut: "Inconnu" },
  { id: 6, nom: "Jean-Pierre M.", num: "+237 672 121 212", statut: "Sécurisé" },
  { id: 7, nom: "Fatou Diop", num: "+237 690 343 434", statut: "Sécurisé" },
  { id: 8, nom: "Boubacar S.", num: "+237 655 565 656", statut: "À signaler" },
];

/** Modèles de message d'alerte pré-rédigés (§9.5 — éditables) */
export const alertTemplates = [
  {
    id: "vol",
    label: "Téléphone volé",
    text: "Bonjour, mon téléphone a été volé. Le numéro {numero} est désormais compromis. N'envoyez aucun argent et ne répondez à aucune demande venant de ce numéro. Je vous recontacterai depuis une nouvelle ligne.",
  },
  {
    id: "sim",
    label: "SIM détournée",
    text: "Attention : ma carte SIM associée au {numero} a été détournée. Toute demande d'argent provenant de ce numéro est frauduleuse. Merci de l'ignorer et de prévenir nos proches.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp piraté",
    text: "Mon compte WhatsApp lié au {numero} a été piraté. Ne cliquez sur aucun lien et n'envoyez aucun code reçu de ma part. Je récupère mon compte au plus vite.",
  },
];

/* ───────────────────────────────────────────────────────────────────────────
   9. PARTENAIRES
─────────────────────────────────────────────────────────────────────────── */
export const partnersData: Partner[] = [
  { id: 1, name: "MTN Cameroun", type: "Opérateur", pays: "Cameroun", numeros: 28430, statut: "Actif", date: "15/01/2023", contact: "Diallo Kouyaté", email: "dkouyate@mtn.com", phone: "+237 699 123 456" },
  { id: 2, name: "Orange CI", type: "Opérateur", pays: "Côte d'Ivoire", numeros: 19820, statut: "Actif", date: "03/03/2023", contact: "Aminata Bah", email: "abah@orange.ci", phone: "+225 07 12 34 56 78" },
  { id: 3, name: "Wave Sénégal", type: "Fintech", pays: "Sénégal", numeros: 12100, statut: "Actif", date: "20/06/2023", contact: "Omar Sy", email: "osy@wave.com", phone: "+221 77 456 12 34" },
  { id: 4, name: "Société Générale CI", type: "Banque", pays: "Côte d'Ivoire", numeros: 8750, statut: "Actif", date: "11/09/2023", contact: "Paul Yao", email: "pyao@sgci.com", phone: "+225 05 98 76 54 32" },
  { id: 5, name: "Airtel Kenya", type: "Opérateur", pays: "Kenya", numeros: 5200, statut: "Suspendu", date: "28/11/2023", contact: "James Otieno", email: "jotieno@airtel.ke", phone: "+254 73 111 2233" },
  { id: 6, name: "Moov Burkina", type: "Opérateur", pays: "Burkina Faso", numeros: 3410, statut: "Actif", date: "07/02/2024", contact: "Salif Compaoré", email: "scompaore@moov.bf", phone: "+226 70 998 877" },
];

export const PARTNER_TYPES: PartnerType[] = ["Opérateur", "Fintech", "Banque", "Régulateur"];
export const PARTNER_STATUSES: PartnerStatus[] = ["Actif", "Suspendu"];

/* ───────────────────────────────────────────────────────────────────────────
   10. NUMÉROS ANALYSÉS
─────────────────────────────────────────────────────────────────────────── */
export const numbersData: PhoneNumber[] = [
  { id: 1, num: "+237 690 123 456", op: "MTN", pays: "Cameroun", score: 92, statut: "Sécurisé", partenaire: "MTN Cameroun", compte: "jean.mbeki@kwismo.com", verif: "20/07/2026 09:14" },
  { id: 2, num: "+225 07 45 678 901", op: "Orange", pays: "Côte d'Ivoire", score: 34, statut: "À signaler", partenaire: "Orange CI", compte: "pyao@sgci.com", verif: "20/07/2026 08:52" },
  { id: 3, num: "+221 77 234 56 78", op: "Wave", pays: "Sénégal", score: 8, statut: "Frauduleux", partenaire: "Wave Sénégal", compte: null, verif: "19/07/2026 17:30" },
  { id: 4, num: "+237 655 987 654", op: "Orange", pays: "Cameroun", score: 88, statut: "Sécurisé", partenaire: "MTN Cameroun", compte: "alice.nguesso@kwismo.com", verif: "20/07/2026 10:01" },
  { id: 5, num: "+234 80 1234 5678", op: "MTN", pays: "Nigéria", score: 51, statut: "À signaler", partenaire: "—", compte: "ngozi.adeyemi@gmail.com", verif: "20/07/2026 07:44" },
  { id: 6, num: "+233 24 456 7890", op: "Airtel", pays: "Ghana", score: 95, statut: "Sécurisé", partenaire: "Airtel Kenya", compte: "k.asante@mtn.gh", verif: "20/07/2026 11:20" },
  { id: 7, num: "+237 677 321 987", op: "MTN", pays: "Cameroun", score: 12, statut: "Frauduleux", partenaire: "MTN Cameroun", compte: null, verif: "20/07/2026 12:00" },
  { id: 8, num: "+226 70 456 789", op: "Moov", pays: "Burkina Faso", score: 76, statut: "Sécurisé", partenaire: "Moov Burkina", compte: null, verif: "20/07/2026 08:30" },
  { id: 9, num: "+237 691 234 567", op: "MTN", pays: "Cameroun", score: 97, statut: "Sécurisé", partenaire: "MTN Cameroun", compte: "alice.nguesso@kwismo.com", verif: "21/07/2026 09:00" },
  { id: 10, num: "+221 70 445 88 12", op: "Wave", pays: "Sénégal", score: 64, statut: "À signaler", partenaire: "Wave Sénégal", compte: "i.sow@orange.sn", verif: "21/07/2026 10:12" },
  { id: 11, num: "+237 699 456 123", op: "MTN", pays: "Cameroun", score: 21, statut: "Frauduleux", partenaire: "MTN Cameroun", compte: null, verif: "21/07/2026 14:33" },
  { id: 12, num: "+225 05 11 22 33 44", op: "Moov", pays: "Côte d'Ivoire", score: 83, statut: "Sécurisé", partenaire: "Orange CI", compte: null, verif: "22/07/2026 07:15" },
  { id: 13, num: "+237 699 123 456", op: "MTN", pays: "Cameroun", score: 94, statut: "Sécurisé", partenaire: "MTN Cameroun", compte: "dkouyate@mtn.com", verif: "22/07/2026 08:40" },
  { id: 14, num: "+237 668 774 210", op: "MTN", pays: "Cameroun", score: 47, statut: "À signaler", partenaire: "MTN Cameroun", compte: null, verif: "22/07/2026 11:05" },
];

export const NUMBER_RISK_STATUSES: NumberRiskStatus[] = ["Sécurisé", "À signaler", "Frauduleux"];
export const NUMBER_OWNER_STATUSES: NumberOwnerStatus[] = ["Vérifié", "En attente", "Compromis"];

/** Motifs de signalement (§9.7 mobile) */
export const REPORT_REASONS = ["Arnaque", "Faux agent", "Phishing", "Spam", "Vishing (appel frauduleux)", "Autre"];

/* ───────────────────────────────────────────────────────────────────────────
   11. RÈGLES D'AFFILIATION
─────────────────────────────────────────────────────────────────────────── */
export const affiliationRules: AffiliationRule[] = [
  { id: 1, partenaire: "MTN Cameroun", pays: "Cameroun", prefixes: ["67", "68", "650-654"], numerosConcernes: 28430, actif: true },
  { id: 2, partenaire: "Orange CI", pays: "Côte d'Ivoire", prefixes: ["07", "08", "09"], numerosConcernes: 19820, actif: true },
  { id: 3, partenaire: "Wave Sénégal", pays: "Sénégal", prefixes: ["70", "75-76"], numerosConcernes: 12100, actif: true },
  { id: 4, partenaire: "Société Générale CI", pays: "Côte d'Ivoire", prefixes: ["05"], numerosConcernes: 8750, actif: true },
  { id: 5, partenaire: "Airtel Kenya", pays: "Kenya", prefixes: ["73", "78"], numerosConcernes: 5200, actif: false },
  { id: 6, partenaire: "Moov Burkina", pays: "Burkina Faso", prefixes: ["70-71"], numerosConcernes: 3410, actif: true },
];

export function detectOverlaps(
  rules: AffiliationRule[],
): { a: AffiliationRule; b: AffiliationRule; prefix: string }[] {
  const expand = (p: string): number[] => {
    const range = p.split("-");
    if (range.length === 2) {
      const start = parseInt(range[0], 10);
      const end = parseInt(range[1], 10);
      if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    const v = parseInt(p, 10);
    return Number.isNaN(v) ? [] : [v];
  };

  const conflicts: { a: AffiliationRule; b: AffiliationRule; prefix: string }[] = [];

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (rules[i].pays !== rules[j].pays) continue;
      const setA = new Set(rules[i].prefixes.flatMap(expand));
      for (const p of rules[j].prefixes) {
        let found = false;
        for (const v of expand(p)) {
          if (setA.has(v)) {
            conflicts.push({ a: rules[i], b: rules[j], prefix: String(v) });
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
  }
  return conflicts;
}

/* ───────────────────────────────────────────────────────────────────────────
   12. PAYS / OPÉRATEURS / CODES USSD
─────────────────────────────────────────────────────────────────────────── */
export const countriesData: Country[] = [
  {
    id: 1, pays: "Cameroun", code: "CM", indicatif: "+237", isDefault: true,
    operateurs: [
      {
        id: 11, nom: "MTN Cameroun", prefixes: ["67", "68", "650-654"],
        ussd: [
          { id: 111, label: "Transfert", code: "*126*{numero}*{montant}#" },
          { id: 112, label: "Retrait", code: "*127*{numero}*{montant}#" },
          { id: 113, label: "Consultation de solde", code: "*126#" },
        ],
      },
      {
        id: 12, nom: "Orange Cameroun", prefixes: ["655-659", "69"],
        ussd: [
          { id: 121, label: "Transfert", code: "*150*{numero}*{montant}#" },
          { id: 122, label: "Retrait", code: "*151*{numero}*{montant}#" },
        ],
      },
      {
        id: 13, nom: "Camtel", prefixes: ["620-624"],
        ussd: [{ id: 131, label: "Transfert", code: "*400*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 2, pays: "Côte d'Ivoire", code: "CI", indicatif: "+225", isDefault: false,
    operateurs: [
      {
        id: 21, nom: "Orange CI", prefixes: ["07", "08", "09"],
        ussd: [
          { id: 211, label: "Transfert", code: "*144*{numero}*{montant}#" },
          { id: 212, label: "Retrait", code: "*144*2*{numero}*{montant}#" },
        ],
      },
      {
        id: 22, nom: "Moov Africa CI", prefixes: ["01", "02", "03"],
        ussd: [{ id: 221, label: "Transfert", code: "*155*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 3, pays: "Sénégal", code: "SN", indicatif: "+221", isDefault: false,
    operateurs: [
      {
        id: 31, nom: "Orange Sénégal", prefixes: ["77", "78"],
        ussd: [{ id: 311, label: "Transfert", code: "*144*{numero}*{montant}#" }],
      },
      {
        id: 32, nom: "Wave", prefixes: ["70", "75", "76"],
        ussd: [{ id: 321, label: "Transfert", code: "*999*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 4, pays: "Burkina Faso", code: "BF", indicatif: "+226", isDefault: false,
    operateurs: [
      {
        id: 41, nom: "Moov Burkina", prefixes: ["70", "71"],
        ussd: [{ id: 411, label: "Transfert", code: "*555*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 5, pays: "Ghana", code: "GH", indicatif: "+233", isDefault: false,
    operateurs: [
      {
        id: 51, nom: "MTN Ghana", prefixes: ["24", "54", "55"],
        ussd: [{ id: 511, label: "Transfert", code: "*170*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 6, pays: "Kenya", code: "KE", indicatif: "+254", isDefault: false,
    operateurs: [
      {
        id: 61, nom: "Airtel Kenya", prefixes: ["73", "78"],
        ussd: [{ id: 611, label: "Transfert", code: "*334*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 7, pays: "Nigéria", code: "NG", indicatif: "+234", isDefault: false,
    operateurs: [
      {
        id: 71, nom: "MTN Nigeria", prefixes: ["80", "81", "70"],
        ussd: [{ id: 711, label: "Transfert", code: "*904*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 8, pays: "Mali", code: "ML", indicatif: "+223", isDefault: false,
    operateurs: [
      {
        id: 81, nom: "Orange Mali", prefixes: ["76", "77"],
        ussd: [{ id: 811, label: "Transfert", code: "*144*{numero}*{montant}#" }],
      },
    ],
  },
  {
    id: 9, pays: "Tunisie", code: "TN", indicatif: "+216", isDefault: false,
    operateurs: [
      {
        id: 91, nom: "Ooredoo Tunisie", prefixes: ["20", "21", "22"],
        ussd: [{ id: 911, label: "Transfert", code: "*180*{numero}*{montant}#" }],
      },
    ],
  },
];

export const USSD_TOKENS = ["{numero}", "{montant}", "{code}"] as const;

export function previewUssd(code: string): string {
  return code
    .replace(/\{numero\}/g, "691234567")
    .replace(/\{montant\}/g, "5000")
    .replace(/\{code\}/g, "1234");
}

/* ───────────────────────────────────────────────────────────────────────────
   13. DROITS D'ACCÈS — modules, actions et rôles
─────────────────────────────────────────────────────────────────────────── */
export interface PermAction {
  id: string;
  label: string;
  critique?: boolean;
}

export interface PermModule {
  id: string;
  label: string;
  desc: string;
  actions: PermAction[];
}

export const permModules: PermModule[] = [
  {
    id: "dashboard", label: "Dashboard", desc: "Vue d'ensemble et KPI globaux",
    actions: [
      { id: "view", label: "Voir" },
      { id: "export", label: "Exporter" },
    ],
  },
  {
    id: "users", label: "Utilisateurs", desc: "Comptes et numéros rattachés",
    actions: [
      { id: "view", label: "Voir" },
      { id: "create", label: "Créer" },
      { id: "edit", label: "Éditer" },
      { id: "delete", label: "Supprimer", critique: true },
      { id: "suspend", label: "Suspendre", critique: true },
      { id: "invite", label: "Inviter" },
    ],
  },
  {
    id: "partners", label: "Partenaires", desc: "Entreprises partenaires",
    actions: [
      { id: "view", label: "Voir" },
      { id: "create", label: "Créer" },
      { id: "edit", label: "Éditer" },
      { id: "delete", label: "Supprimer", critique: true },
      { id: "impersonate", label: "Superviser", critique: true },
    ],
  },
  {
    id: "numbers", label: "Numéros", desc: "Numéros analysés et affiliation",
    actions: [
      { id: "view", label: "Voir" },
      { id: "create", label: "Créer" },
      { id: "edit", label: "Éditer" },
      { id: "delete", label: "Supprimer", critique: true },
      { id: "reanalyze", label: "Réanalyser" },
      { id: "changeStatus", label: "Changer le statut", critique: true },
      { id: "affiliate", label: "Gérer l'affiliation", critique: true },
    ],
  },
  {
    id: "countries", label: "Pays / USSD", desc: "Pays, opérateurs et codes USSD",
    actions: [
      { id: "view", label: "Voir" },
      { id: "create", label: "Créer" },
      { id: "edit", label: "Éditer" },
      { id: "delete", label: "Supprimer", critique: true },
    ],
  },
  {
    id: "access", label: "Droits d'accès", desc: "Rôles et permissions",
    actions: [
      { id: "view", label: "Voir" },
      { id: "create", label: "Créer un rôle" },
      { id: "edit", label: "Éditer" },
      { id: "delete", label: "Supprimer", critique: true },
      { id: "assign", label: "Attribuer un rôle", critique: true },
    ],
  },
  {
    id: "reports", label: "Rapports", desc: "Analyses et exports",
    actions: [
      { id: "view", label: "Voir" },
      { id: "export", label: "Exporter" },
      { id: "schedule", label: "Planifier" },
    ],
  },
];

export function buildPerms(value: boolean): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const mod of permModules) {
    out[mod.id] = {};
    for (const act of mod.actions) out[mod.id][act.id] = value;
  }
  return out;
}

function permsFrom(granted: Record<string, string[]>): Record<string, Record<string, boolean>> {
  const out = buildPerms(false);
  for (const [modId, actions] of Object.entries(granted)) {
    if (!out[modId]) continue;
    for (const actId of actions) {
      if (actId in out[modId]) out[modId][actId] = true;
    }
  }
  return out;
}

export const rolesData: Role[] = [
  {
    id: 1, role: "Admin", desc: "Accès complet à toute la plateforme",
    color: BLUE, systeme: true, count: 3, perms: buildPerms(true),
  },
  {
    id: 2, role: "Partenaire", desc: "Accès limité à son périmètre affilié",
    color: PURPLE, systeme: true, count: 12,
    perms: permsFrom({
      dashboard: ["view", "export"],
      users: ["view"],
      numbers: ["view", "reanalyze", "changeStatus"],
      reports: ["view", "export"],
    }),
  },
  {
    id: 3, role: "Analyste", desc: "Lecture seule — rapports et indicateurs",
    color: CYAN, systeme: false, count: 8,
    perms: permsFrom({
      dashboard: ["view", "export"],
      users: ["view"],
      partners: ["view"],
      numbers: ["view", "reanalyze"],
      countries: ["view"],
      reports: ["view", "export", "schedule"],
    }),
  },
  {
    id: 4, role: "Support", desc: "Gestion des comptes utilisateurs",
    color: ORANGE, systeme: false, count: 5,
    perms: permsFrom({
      dashboard: ["view"],
      users: ["view", "create", "edit", "suspend", "invite"],
      numbers: ["view"],
      reports: ["view"],
    }),
  },
];

/* ───────────────────────────────────────────────────────────────────────────
   14. JOURNAL & NOTIFICATIONS
─────────────────────────────────────────────────────────────────────────── */
export const recentActions = [
  { id: 1, user: "Alice Nguesso", action: "Numéro +237 677 321 987 marqué frauduleux", time: "Il y a 5 min", color: RED },
  { id: 2, user: "Jean Mbeki", action: "Partenaire Airtel Kenya suspendu", time: "Il y a 23 min", color: ORANGE },
  { id: 3, user: "Alice Nguesso", action: "Invitation envoyée à support@mtn.cm", time: "Il y a 1 h", color: BLUE },
  { id: 4, user: "Ibrahima Sow", action: "Rapport PDF exporté", time: "Il y a 2 h", color: GREEN },
  { id: 5, user: "Alice Nguesso", action: "Droits du rôle Analyste mis à jour", time: "Hier 14:30", color: BLUE },
  { id: 6, user: "Moussa Diarra", action: "Numéro +221 77 234 56 78 signalé", time: "Hier 10:15", color: ORANGE },
  { id: 7, user: "Fatimata Ouédraogo", action: "Règle d'affiliation Moov Burkina créée", time: "Hier 09:02", color: GREEN },
];

export const notificationsInit: Notification[] = [
  { id: 1, type: "danger", title: "Numéro frauduleux détecté", desc: "+237 677 321 987 classé comme frauduleux.", time: "Il y a 5 min", read: false },
  { id: 2, type: "warning", title: "Partenaire suspendu", desc: "Airtel Kenya a été suspendu automatiquement.", time: "Il y a 23 min", read: false },
  { id: 3, type: "info", title: "Invitation acceptée", desc: "support@mtn.cm a rejoint la plateforme.", time: "Il y a 1 h", read: false },
  { id: 4, type: "success", title: "Export PDF généré", desc: "Le rapport du 20/07/2026 est prêt.", time: "Il y a 2 h", read: true },
  { id: 5, type: "info", title: "Règles USSD mises à jour", desc: "2 nouveaux codes USSD pour MTN Cameroun.", time: "Hier", read: true },
  { id: 6, type: "warning", title: "Chevauchement de préfixes", desc: "Conflit détecté entre Wave Sénégal et Orange Sénégal.", time: "Hier", read: true },
];

/** Notifications de l'espace utilisateur (§9 mobile) */
export const userNotificationsInit: Notification[] = [
  { id: 1, type: "danger", title: "Appel suspect détecté", desc: "Un appel de +237 699 456 123 a été identifié comme frauduleux.", time: "Il y a 10 min", read: false },
  { id: 2, type: "success", title: "Numéro vérifié", desc: "Votre numéro +237 655 112 233 est vérifié.", time: "Il y a 3 h", read: false },
  { id: 3, type: "warning", title: "Vérification en attente", desc: "Confirmez votre numéro +237 680 998 877 par OTP SMS.", time: "Hier", read: true },
  { id: 4, type: "info", title: "Nouvelle protection", desc: "La détection d'appel est désormais active.", time: "Il y a 2 j", read: true },
];

/* ───────────────────────────────────────────────────────────────────────────
   15. LANDING PAGE
─────────────────────────────────────────────────────────────────────────── */
export const compFeatures: [string, boolean, boolean, boolean][] = [
  ["Analyse des numéros", true, true, true],
  ["Protection Mobile Money", false, false, true],
  ["Signalement communautaire", true, true, true],
  ["Adaptation réseaux africains", false, false, true],
  ["Alerte WhatsApp piratage", false, false, true],
  ["Disponibilité grand public Afrique", false, false, true],
];

export const landingFeatures = [
  { icon: Shield, title: "Vérification de numéro", desc: "Analyse instantanée pour détecter fraude et risque avant un transfert." },
  { icon: Lock, title: "Transfert protégé USSD", desc: "Couche de sécurité sur chaque transfert Mobile Money via code USSD." },
  { icon: PhoneOff, title: "Détection d'appel suspect", desc: "Identification des appels entrants à risque : faux service client, phishing." },
  { icon: UserCheck, title: "Contacts à insigne", desc: "Vos proches obtiennent un badge de confiance vérifié par la communauté." },
  { icon: MessageCircle, title: "Alerte WhatsApp", desc: "Notification immédiate si votre compte WhatsApp subit une tentative de piratage." },
  { icon: Users, title: "Signalement communautaire", desc: "Chaque signalement renforce la base de données collective contre la fraude." },
];

/* ───────────────────────────────────────────────────────────────────────────
   16. UTILITAIRES PARTAGÉS
─────────────────────────────────────────────────────────────────────────── */
export const fullName = (u: Pick<AppUser, "prenom" | "nom">) => `${u.prenom} ${u.nom}`;

export const initials = (u: Pick<AppUser, "prenom" | "nom">) =>
  `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();

export const hasCompromised = (u: AppUser) => u.numeros.some(n => n.statut === "Compromis");

export const fmtNum = (n: number) =>
  n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

let _seq = 10_000;
export const nextId = () => ++_seq;
