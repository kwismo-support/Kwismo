// Application client router with lazy loading, role guards, and route definitions.
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

const LandingPage          = lazy(() => import('@/features/landing'));
const AuthPage             = lazy(() => import('@/features/auth'));
const PartnerRequestPage   = lazy(() => import('@/features/partner-request'));
const DashboardPage        = lazy(() => import('@/features/dashboard'));
const UsersPage            = lazy(() => import('@/features/users'));
const NumbersPage          = lazy(() => import('@/features/numbers'));
const PartnersPage         = lazy(() => import('@/features/partners'));
const UssdPage             = lazy(() => import('@/features/ussd'));
const AccessControlPage    = lazy(() => import('@/features/access-control'));
const ReportsPage          = lazy(() => import('@/features/reports'));
const UserPortalPage       = lazy(() => import('@/features/user'));

const PageRouteLoader = () => (
  <div className="w-full h-1 bg-slate-100 dark:bg-white/5 overflow-hidden">
    <div className="h-full bg-brand-green animate-pulse w-full" />
  </div>
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageRouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/numbers"   element={<NumbersPage />} />
              <Route path="/app/reports"   element={<ReportsPage />} />
              <Route path="/app/user"      element={<UserPortalPage />} />

              <Route element={<RoleGuard roles={['admin']} />}>
                <Route path="/app/users"   element={<UsersPage />} />
                <Route path="/app/partners" element={<PartnersPage />} />
                <Route path="/app/ussd"    element={<UssdPage />} />
                <Route path="/app/access"  element={<AccessControlPage />} />
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
