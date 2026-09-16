import { useAuthStore } from '@/shared/store/authStore';
import type { UserRole, PermissionCode } from '@/shared/types/access';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const rawRole = (user?.role || 'user').toLowerCase();
  const role: UserRole = rawRole === 'admin' || rawRole === 'super_admin' ? 'admin' : rawRole === 'partner' ? 'partner' : 'user';

  const isAdmin = role === 'admin';
  const isPartner = role === 'partner';
  const isUser = role === 'user';

  // Matrice de permissions par défaut basées sur les rôles principaux
  const defaultPermissions: Record<string, PermissionCode[]> = {
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete', 'users:export',
      'numbers:read', 'numbers:create', 'numbers:update', 'numbers:delete', 'numbers:verify', 'numbers:export',
      'reports:read', 'reports:create', 'reports:verify', 'reports:delete', 'reports:export',
      'partners:read', 'partners:create', 'partners:update', 'partners:delete', 'partners:export',
      'affiliation:read', 'affiliation:create', 'affiliation:update', 'affiliation:delete',
      'ussd:read', 'ussd:create', 'ussd:update', 'ussd:delete', 'ussd:export',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'analytics:read', 'settings:read', 'settings:update', 'system:configure',
      'phones:manage', 'devices:manage',
    ],
    partner: [
      'analytics:read',
      'reports:read', 'reports:create', 'reports:export',
      'numbers:read', 'numbers:verify', 'numbers:export',
      'users:read',
      'affiliation:read', 'affiliation:create', 'affiliation:update', 'affiliation:delete',
      'settings:read',
    ],
    user: [
      'reports:read', 'reports:create',
      'numbers:read', 'numbers:verify',
      'phones:manage', 'devices:manage',
      'settings:read',
    ],
  };

  const currentPermissions: PermissionCode[] = defaultPermissions[role] || defaultPermissions.user;

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(role);
  };

  const hasPermission = (permission: PermissionCode): boolean => {
    if (!user) return false;
    if (isAdmin) return true; // Les admins globaux ont tous les accès
    return currentPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: PermissionCode[]): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return permissions.some((p) => currentPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: PermissionCode[]): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return permissions.every((p) => currentPermissions.includes(p));
  };

  return {
    user,
    role,
    isAdmin,
    isPartner,
    isUser,
    partnerId: user?.partnerId,
    currentPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
