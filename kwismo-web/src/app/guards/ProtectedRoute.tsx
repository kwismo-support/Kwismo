import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

/**
 * Bloque l'accès si l'utilisateur n'est pas authentifié.
 * Redirige vers /auth/login.
 */
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
