import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

/**
 * Réservé aux visiteurs non authentifiés.
 * Redirige vers /app/dashboard si déjà connecté.
 */
export function GuestGuard() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
