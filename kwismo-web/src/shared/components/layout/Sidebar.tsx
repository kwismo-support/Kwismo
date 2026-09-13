import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { useThemeStore } from '@/shared/store/themeStore';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
  iconColor: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', icon: 'solar:widget-bold-duotone', label: 'Dashboard', iconColor: 'text-brand-blue' },
  { to: '/app/numbers', icon: 'solar:hashtag-square-bold-duotone', label: 'Numéros', iconColor: 'text-brand-green' },
  { to: '/app/users', icon: 'solar:users-group-two-rounded-bold-duotone', label: 'Utilisateurs', iconColor: 'text-brand-navy dark:text-blue-400' },
  { to: '/app/partners', icon: 'solar:buildings-bold-duotone', label: 'Partenaires', iconColor: 'text-brand-orange' },
  { to: '/app/ussd', icon: 'solar:global-bold-duotone', label: 'Pays & USSD', iconColor: 'text-purple-500' },
  { to: '/app/access', icon: 'solar:shield-keyhole-bold-duotone', label: 'Droits d\'accès', iconColor: 'text-amber-500', roles: ['admin', 'super_admin'] },
  { to: '/app/reports', icon: 'solar:chart-bold-duotone', label: 'Rapports', iconColor: 'text-emerald-500' },
  { to: '/app/settings', icon: 'solar:settings-bold-duotone', label: 'Paramètres', iconColor: 'text-slate-500' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/auth/login', { replace: true });
  };

  const userRole = (user?.role || 'admin').toLowerCase();

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
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
        {/* Brand Header */}
        <div className={cn(
          "relative flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/10 shrink-0",
          isCollapsed ? "justify-center px-2" : "px-6"
        )}>
          {/* Sleek Arrow Toggle Button on BrandHeader Border Line */}
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
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-title font-bold text-xl transition-colors",
                theme === 'dark'
                  ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/30"
                  : "bg-brand-navy/10 text-brand-navy border border-brand-navy/20"
              )}
              title="KWISMO Anti-Fraud Platform"
            >
              K
            </div>
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

        {/* Nav Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
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
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Footer Button */}
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

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirmer la déconnexion ?"
        description="Êtes-vous sûr de vouloir vous déconnecter de la plateforme KWISMO ? Vous devrez vous réauthentifier pour accéder à nouveau à vos dossiers."
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  );
}

