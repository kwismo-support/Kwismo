import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';


export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
