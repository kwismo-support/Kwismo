export type UserRole = 'admin' | 'partner' | 'user' | 'super_admin' | string;

export type PermissionCode =
  // Utilisateurs
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:export'
  // Numéros
  | 'numbers:read'
  | 'numbers:create'
  | 'numbers:update'
  | 'numbers:delete'
  | 'numbers:verify'
  | 'numbers:export'
  // Signalements de fraude
  | 'reports:read'
  | 'reports:create'
  | 'reports:verify'
  | 'reports:delete'
  | 'reports:export'
  // Partenaires et Règles d'affiliation
  | 'partners:read'
  | 'partners:create'
  | 'partners:update'
  | 'partners:delete'
  | 'partners:export'
  | 'affiliation:read'
  | 'affiliation:create'
  | 'affiliation:update'
  | 'affiliation:delete'
  // USSD et Opérateurs
  | 'ussd:read'
  | 'ussd:create'
  | 'ussd:update'
  | 'ussd:delete'
  | 'ussd:export'
  // Rôles et Droits d'Accès
  | 'roles:read'
  | 'roles:create'
  | 'roles:update'
  | 'roles:delete'
  // Paramètres & Supervision
  | 'analytics:read'
  | 'settings:read'
  | 'settings:update'
  | 'system:configure'
  | 'phones:manage'
  | 'devices:manage';

export interface AccessRight {
  id: string;
  roleId: string;
  permission: PermissionCode;
  description?: string;
}

export interface CustomRole {
  id: string;
  nomRole: string;
  description?: string;
  accessRights?: AccessRight[];
  partnerId?: string | null;
}

export interface UserAccessContext {
  role: UserRole;
  partnerId?: string | null;
  partnerName?: string | null;
  permissions?: PermissionCode[];
}
