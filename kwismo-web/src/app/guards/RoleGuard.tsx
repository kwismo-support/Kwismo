import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import type { Role } from '@/config/constants';

interface RoleGuardProps {
  roles: Role[];
}

/**
 * Bloque l'accès si le rôle de l'utilisateur ne figure pas dans `roles`.
 * Redirige vers /app/dashboard.
 */
export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role as Role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
