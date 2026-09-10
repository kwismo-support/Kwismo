import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';


export function GuestGuard() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
