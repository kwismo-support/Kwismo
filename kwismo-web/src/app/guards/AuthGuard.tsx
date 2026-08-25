import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';

/**
 * Vérifie la session au montage (appel /users/me).
 * Affiche un skeleton pendant la vérification,
 * puis laisse passer ou redirige selon le résultat.
 */
export function AuthGuard() {
  const { user, isLoading, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe().catch(() => navigate('/auth/login', { replace: true }));
  }, [fetchMe, navigate]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return null; // fetchMe gère la redirection via le catch
  }

  return <Outlet />;
}
