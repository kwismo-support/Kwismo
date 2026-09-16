import { Outlet } from 'react-router-dom';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { UserRole, PermissionCode } from '@/shared/types/access';
import { ForbiddenPage } from '@/shared/components/pages/ForbiddenPage';

interface RoleGuardProps {
  roles?: UserRole[];
  permission?: PermissionCode;
}

export function RoleGuard({ roles, permission }: RoleGuardProps) {
  const { user, role, hasPermission } = usePermissions();

  if (!user) {
    return <ForbiddenPage />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <ForbiddenPage />;
  }

  if (permission && !hasPermission(permission)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}

