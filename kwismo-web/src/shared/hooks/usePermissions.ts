import { useAuthStore } from '@/shared/store/authStore';
import type { UserRole, PermissionCode } from '@/shared/types/access';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const rawRole = (user?.role || 'user').toLowerCase();
  const isSuperAdmin = rawRole === 'superadmin' || rawRole === 'super_admin';
  const isAdmin = rawRole === 'admin' || isSuperAdmin;
  const isPartner = rawRole === 'partner';
  const isUser = rawRole === 'user';

  const role: UserRole = isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : isPartner ? 'partner' : 'user';

  const defaultPermissions: Record<string, PermissionCode[]> = {
    super_admin: [
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
    admin: [
      'users:read', 'users:create', 'users:update', 'users:delete', 'users:export',
      'numbers:read', 'numbers:create', 'numbers:update', 'numbers:delete', 'numbers:verify', 'numbers:export',
      'reports:read', 'reports:create', 'reports:verify', 'reports:delete', 'reports:export',
      'partners:read', 'partners:create', 'partners:update', 'partners:delete', 'partners:export',
      'affiliation:read', 'affiliation:create', 'affiliation:update', 'affiliation:delete',
      'ussd:read', 'ussd:create', 'ussd:update', 'ussd:delete', 'ussd:export',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'analytics:read', 'settings:read', 'phones:manage', 'devices:manage',
    ],
    partner: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'reports:read', 'reports:create', 'reports:export',
      'numbers:read', 'numbers:verify', 'numbers:export',
      'analytics:read', 'phones:manage',
    ],
    user: [
      'reports:read', 'reports:create',
      'numbers:read', 'numbers:verify',
      'phones:manage', 'devices:manage',
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
    if (isSuperAdmin) return true;
    return currentPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: PermissionCode[]): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return permissions.some((p) => currentPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: PermissionCode[]): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return permissions.every((p) => currentPermissions.includes(p));
  };

  return {
    user,
    role,
    isSuperAdmin,
    isAdmin,
    isPartner,
    isUser,
    partnerId: user?.partnerId || (user as any)?.partner_id,
    currentPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
