import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';

export function AuthGuard() {
  const { user, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe().catch(() => navigate('/auth/login', { replace: true }));
  }, [fetchMe, navigate]);

  if (!user) {
    return null;
  }

  return <Outlet />;
}
