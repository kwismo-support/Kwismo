import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { GuestGuard } from './guards/GuestGuard';
import { AuthGuard } from './guards/AuthGuard';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ForbiddenPage } from '@/shared/components/pages/ForbiddenPage';
import { NotFoundPage } from '@/shared/components/pages/NotFoundPage';
import { ServerErrorPage } from '@/shared/components/pages/ServerErrorPage';
import { useAuthStore } from '@/shared/store/authStore';
import { PageRouteLoader } from '@/shared/components/PageRouteLoader';

const LandingPage          = lazy(() => import('@/features/landing'));
const AuthPage             = lazy(() => import('@/features/auth'));
const PartnerRequestPage   = lazy(() => import('@/features/partner-request'));
const DashboardPage        = lazy(() => import('@/features/dashboard'));
const UsersPage            = lazy(() => import('@/features/users'));
const UserDetailPage       = lazy(() => import('@/features/users/components/UserDetailPage'));
const NumbersPage          = lazy(() => import('@/features/numbers'));
const NumberDetailPage     = lazy(() => import('@/features/numbers/components/NumberDetailPage'));
const PartnersPage         = lazy(() => import('@/features/partners'));
const PartnerDetailPage    = lazy(() => import('@/features/partners/components/PartnerDetailPage'));
const UssdPage             = lazy(() => import('@/features/ussd'));
const UssdDetailPage       = lazy(() => import('@/features/ussd/components/UssdDetailPage'));
const AccessControlPage    = lazy(() => import('@/features/access-control'));
const ReportsPage          = lazy(() => import('@/features/reports'));
const UserPortalPage       = lazy(() => import('@/features/user'));
const ProfilePage          = lazy(() => import('@/features/profile'));
const SettingsPage         = lazy(() => import('@/features/settings'));
const NotificationsPage    = lazy(() => import('@/features/notifications'));

function AppIndexRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'user') {
    return <Navigate to="/app/user" replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageRouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/partner" element={<PartnerRequestPage />} />
        <Route path="/devenir-partenaire" element={<PartnerRequestPage />} />
        <Route path="/partner-request" element={<PartnerRequestPage />} />
        <Route path="/partner/request" element={<PartnerRequestPage />} />
        <Route path="/partner/register" element={<PartnerRequestPage />} />
        <Route path="/register" element={<PartnerRequestPage />} />
        <Route path="/auth/register" element={<PartnerRequestPage />} />

        <Route element={<GuestGuard />}>
          <Route path="/auth/*" element={<AuthPage />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app" element={<AppIndexRedirect />} />
              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/profile"   element={<ProfilePage />} />
              <Route path="/app/notifications" element={<NotificationsPage />} />

              <Route element={<RoleGuard permission="settings:read" />}>
                <Route path="/app/settings" element={<SettingsPage />} />
              </Route>

              <Route element={<RoleGuard roles={['user']} />}>
                <Route path="/app/user" element={<UserPortalPage />} />
              </Route>

              <Route element={<RoleGuard permission="numbers:read" />}>
                <Route path="/app/numbers" element={<NumbersPage />} />
                <Route path="/app/numbers/:id" element={<NumberDetailPage />} />
              </Route>

              <Route element={<RoleGuard permission="reports:read" />}>
                <Route path="/app/reports" element={<ReportsPage />} />
              </Route>

              <Route element={<RoleGuard permission="users:read" />}>
                <Route path="/app/users" element={<UsersPage />} />
                <Route path="/app/users/:id" element={<UserDetailPage />} />
              </Route>

              <Route element={<RoleGuard permission="roles:read" />}>
                <Route path="/app/access" element={<AccessControlPage />} />
              </Route>

              <Route element={<RoleGuard permission="partners:read" />}>
                <Route path="/app/partners" element={<PartnersPage />} />
                <Route path="/app/partners/:id" element={<PartnerDetailPage />} />
              </Route>

              <Route element={<RoleGuard permission="ussd:read" />}>
                <Route path="/app/ussd" element={<UssdPage />} />
                <Route path="/app/ussd/:id" element={<UssdDetailPage />} />
              </Route>

              <Route path="/app/403" element={<ForbiddenPage />} />
              <Route path="/app/500" element={<ServerErrorPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
