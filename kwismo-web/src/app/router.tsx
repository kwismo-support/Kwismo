import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { GuestGuard } from './guards/GuestGuard';
import { AuthGuard } from './guards/AuthGuard';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';

/* ── Lazy imports ──────────────────────────────────────────── */
const LandingPage       = lazy(() => import('@/features/landing'));
const AuthPage          = lazy(() => import('@/features/auth'));
const DashboardPage     = lazy(() => import('@/features/dashboard'));
const UsersPage         = lazy(() => import('@/features/users'));
const NumbersPage       = lazy(() => import('@/features/numbers'));
const PartnersPage      = lazy(() => import('@/features/partners'));
const UssdPage          = lazy(() => import('@/features/ussd'));
const AccessControlPage = lazy(() => import('@/features/access-control'));
const ReportsPage       = lazy(() => import('@/features/reports'));

const Loader = () => <LoadingSkeleton />;

/**
 * Définition des routes de l'application.
 */
export function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ── Public ──────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth (invité seulement) ──────────────────────── */}
        <Route element={<GuestGuard />}>
          <Route path="/auth/*" element={<AuthPage />} />
        </Route>

        {/* ── Espace protégé ──────────────────────────────── */}
        <Route element={<AuthGuard />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/dashboard" element={<DashboardPage />} />
              <Route path="/app/numbers"   element={<NumbersPage />} />
              <Route path="/app/reports"   element={<ReportsPage />} />

              {/* Admin uniquement */}
              <Route element={<RoleGuard roles={['admin']} />}>
                <Route path="/app/users"   element={<UsersPage />} />
                <Route path="/app/partners" element={<PartnersPage />} />
                <Route path="/app/ussd"    element={<UssdPage />} />
                <Route path="/app/access"  element={<AccessControlPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* ── Fallback ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
