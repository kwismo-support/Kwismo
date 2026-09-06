export interface RoleDTO {
  id: string;
  nomRole: 'user' | 'partner' | 'admin';
  description: string;
  userCount: number;
}

export interface PermissionDTO {
  id: string;
  code: string;
  module: string;
  description: string;
  roles: string[];
}

export const MOCK_ROLES: RoleDTO[] = [
  { id: 'role-admin', nomRole: 'admin', description: 'Administrateur système complet', userCount: 3 },
  { id: 'role-partner', nomRole: 'partner', description: 'Accès entreprise partenaire API', userCount: 12 },
  { id: 'role-user', nomRole: 'user', description: 'Utilisateur grand public', userCount: 1450 },
];

export const MOCK_PERMISSIONS: PermissionDTO[] = [
  { id: 'p-01', code: 'users:read', module: 'Utilisateurs', description: 'Voir les utilisateurs', roles: ['admin', 'partner'] },
  { id: 'p-02', code: 'users:manage', module: 'Utilisateurs', description: 'Créer et modifier des utilisateurs', roles: ['admin'] },
  { id: 'p-03', code: 'partners:manage', module: 'Partenaires', description: 'Gérer les partenaires et règles', roles: ['admin'] },
  { id: 'p-04', code: 'numbers:report', module: 'Numéros', description: 'Signaler un numéro suspect', roles: ['admin', 'partner', 'user'] },
];
