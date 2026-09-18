import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/lib/utils';
import type { PermissionCode, UserRole } from '@/shared/types/access';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: string;
  labelKey: string;
  fallbackLabel: string;
  iconColor: string;
  roles?: UserRole[];
  permission?: PermissionCode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', icon: 'solar:widget-bold-duotone', labelKey: 'nav.dashboard', fallbackLabel: 'Dashboard', iconColor: 'text-brand-blue' },
  { to: '/app/user', icon: 'solar:user-bold-duotone', labelKey: 'nav.myPortal', fallbackLabel: 'Portail Utilisateur', iconColor: 'text-emerald-500', roles: ['user'] },
  { to: '/app/numbers', icon: 'solar:hashtag-square-bold-duotone', labelKey: 'nav.numbers', fallbackLabel: 'Numéros', iconColor: 'text-brand-green', permission: 'numbers:read' },
  { to: '/app/users', icon: 'solar:users-group-two-rounded-bold-duotone', labelKey: 'nav.users', fallbackLabel: 'Utilisateurs', iconColor: 'text-brand-navy dark:text-blue-400', permission: 'users:read' },
  { to: '/app/partners', icon: 'solar:buildings-bold-duotone', labelKey: 'nav.partners', fallbackLabel: 'Partenaires', iconColor: 'text-brand-orange', permission: 'partners:read' },
  { to: '/app/ussd', icon: 'solar:global-bold-duotone', labelKey: 'nav.ussd', fallbackLabel: 'Pays & USSD', iconColor: 'text-purple-500', permission: 'ussd:read' },
  { to: '/app/access', icon: 'solar:shield-keyhole-bold-duotone', labelKey: 'nav.access', fallbackLabel: "Droits d'accès", iconColor: 'text-amber-500', permission: 'roles:read' },
  { to: '/app/reports', icon: 'solar:chart-bold-duotone', labelKey: 'nav.reports', fallbackLabel: 'Rapports', iconColor: 'text-emerald-500', permission: 'reports:read' },
  { to: '/app/settings', icon: 'solar:settings-bold-duotone', labelKey: 'nav.settings', fallbackLabel: 'Paramètres', iconColor: 'text-slate-500', permission: 'settings:read' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { role, hasPermission } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/auth/login', { replace: true });
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <>
      <aside
        aria-label="Navigation principale"
        className={cn(
          'relative fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-white/10',
          'bg-white dark:bg-[#161E33] transition-all duration-300 font-body',
          'lg:static lg:translate-x-0',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          open ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
        <div className={cn(
          "relative flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/10 shrink-0",
          isCollapsed ? "justify-center px-2" : "px-6"
        )}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-[#161E33] text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md transition cursor-pointer"
            title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            <Icon
              icon={isCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'}
              className="text-xs"
            />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="KWISMO Logo"
              className="h-9 w-9 shrink-0 object-contain"
              title="KWISMO Anti-Fraud Platform"
            />
            {!isCollapsed && (
              <span className="font-title text-xl font-bold tracking-tight text-brand-navy dark:text-white transition-opacity">
                KWISMO
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
          >
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {filteredNavItems.map((item) => {
            const label = t(item.labelKey, { defaultValue: item.fallbackLabel });
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl py-3 text-xs sm:text-sm font-medium transition-all duration-150',
                    isCollapsed ? 'justify-center px-0' : 'px-3.5',
                    isActive
                      ? 'bg-brand-navy dark:bg-brand-orange text-white shadow-md shadow-brand-navy/10 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      icon={item.icon}
                      className={cn(
                        'text-xl shrink-0 transition-transform duration-150',
                        isActive ? 'scale-110 text-white dark:text-brand-navy' : item.iconColor
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setShowLogoutModal(true)}
            title={isCollapsed ? t('actions.logout') : undefined}
            className={cn(
              'flex items-center rounded-xl py-3 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer',
              isCollapsed ? 'w-full justify-center px-0' : 'w-full gap-3 px-3.5'
            )}
          >
            <Icon icon="solar:logout-3-bold" className="text-xl shrink-0 text-rose-500" />
            {!isCollapsed && <span>{t('actions.logout')}</span>}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title={t('dialogs.logoutTitle', { defaultValue: 'Confirmer la déconnexion ?' })}
        description={t('dialogs.logoutDescription', { defaultValue: 'Êtes-vous sûr de vouloir vous déconnecter de la plateforme KWISMO ? vous devrez vous réauthentifier pour accéder à nouveau à vos dossiers.' })}
        confirmLabel={t('actions.logout', { defaultValue: 'Déconnexion' })}
        cancelLabel={t('actions.cancel', { defaultValue: 'Annuler' })}
        variant="danger"
      />
    </>
  );
}
