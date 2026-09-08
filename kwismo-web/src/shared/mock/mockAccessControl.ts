export interface RoleDTO {
  id: string;
  nomRole: string;
  description: string;
  userCount: number;
  color?: string;
  systeme?: boolean;
  perms?: Record<string, Record<string, boolean>>;
}

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

export interface PermissionDTO {
  id: string;
  code: string;
  module: string;
  description: string;
  roles: string[];
}

export const PERM_MODULES: PermModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    desc: 'Vue d\'ensemble et KPI globaux',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'export', label: 'Exporter' },
    ],
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    desc: 'Comptes et numéros rattachés',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'suspend', label: 'Suspendre', critique: true },
      { id: 'invite', label: 'Inviter' },
    ],
  },
  {
    id: 'partners',
    label: 'Partenaires',
    desc: 'Entreprises partenaires',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'impersonate', label: 'Superviser', critique: true },
    ],
  },
  {
    id: 'numbers',
    label: 'Numéros',
    desc: 'Numéros analysés et affiliation',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'reanalyze', label: 'Réanalyser' },
      { id: 'changeStatus', label: 'Changer le statut', critique: true },
      { id: 'affiliate', label: 'Gérer l\'affiliation', critique: true },
    ],
  },
  {
    id: 'countries',
    label: 'Pays / USSD',
    desc: 'Pays, opérateurs et codes USSD',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
    ],
  },
  {
    id: 'access',
    label: 'Droits d\'accès',
    desc: 'Rôles et permissions',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer un rôle' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'assign', label: 'Attribuer un rôle', critique: true },
    ],
  },
  {
    id: 'reports',
    label: 'Rapports',
    desc: 'Analyses et exports',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'export', label: 'Exporter' },
      { id: 'schedule', label: 'Planifier' },
    ],
  },
];

export const MOCK_ROLES: RoleDTO[] = [
  {
    id: 'role-admin',
    nomRole: 'Admin',
    description: 'Accès complet à toute la plateforme',
    userCount: 3,
    color: '#4D6AB1',
    systeme: true,
  },
  {
    id: 'role-partner',
    nomRole: 'Partenaire',
    description: 'Accès limité à son périmètre affilié',
    userCount: 12,
    color: '#7C3AED',
    systeme: true,
  },
  {
    id: 'role-analyst',
    nomRole: 'Analyste',
    description: 'Lecture seule — rapports et indicateurs',
    userCount: 8,
    color: '#0891B2',
    systeme: false,
  },
  {
    id: 'role-support',
    nomRole: 'Support',
    description: 'Gestion des comptes utilisateurs',
    userCount: 5,
    color: '#F6A020',
    systeme: false,
  },
];

export const MOCK_PERMISSIONS: PermissionDTO[] = [
  { id: 'p-01', code: 'users:read', module: 'Utilisateurs', description: 'Voir les utilisateurs', roles: ['Admin', 'Partenaire', 'Analyste', 'Support'] },
  { id: 'p-02', code: 'users:manage', module: 'Utilisateurs', description: 'Créer et modifier des utilisateurs', roles: ['Admin', 'Support'] },
  { id: 'p-03', code: 'partners:manage', module: 'Partenaires', description: 'Gérer les partenaires et règles', roles: ['Admin'] },
  { id: 'p-04', code: 'numbers:report', module: 'Numéros', description: 'Signaler un numéro suspect', roles: ['Admin', 'Partenaire', 'Analyste', 'Support'] },
  { id: 'p-05', code: 'access:manage', module: 'Droits d\'accès', description: 'Attribuer les rôles et privilèges', roles: ['Admin'] },
];
