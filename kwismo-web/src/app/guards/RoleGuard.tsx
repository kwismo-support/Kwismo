import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import type { Role } from '@/config/constants';
import { ForbiddenPage } from '@/shared/components/pages/ForbiddenPage';

interface RoleGuardProps {
  roles: Role[];
}


export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role as Role)) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
