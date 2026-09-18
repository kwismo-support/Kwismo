import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/shared/ui/dropdown-menu';
import { UserAvatar } from '@/shared/ui/avatar';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from '@/shared/store/toastStore';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { Breadcrumb } from './Breadcrumb';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userRoleStr = typeof user?.role === 'string' ? user.role : '';
  const isSuperAdmin = userRoleStr.toLowerCase().includes('super');
  const [globalSearch, setGlobalSearch] = useState('');
  const { rawNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      toast.info(`Recherche de "${globalSearch}" en cours...`);
      navigate(`/app/numbers?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] px-4 sm:px-6 font-body shrink-0 gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <Icon icon="solar:hamburger-menu-bold" className="text-xl" />
        </button>
        <Breadcrumb />
      </div>

      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center">
        <div className="relative w-full">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"
          />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Rechercher un numéro, un partenaire, un utilisateur..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-green font-body transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <LanguageSwitcher />
        <ThemeToggle />

        <DropdownMenu
          trigger={
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <Icon icon="solar:bell-bold" className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between min-w-[300px]">
            <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[10px] font-bold text-brand-green hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
            {rawNotifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Aucune notification</p>
            ) : (
              rawNotifications.slice(0, 4).map((notif) => (
                <DropdownItem
                  key={notif.id}
                  onClick={() => {
                    if (!notif.lu) markAsRead(notif.id);
                    navigate('/app/notifications');
                  }}
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                        notif.lu ? 'bg-slate-300 dark:bg-white/20' : 'bg-brand-orange'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                        {notif.texte}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </DropdownItem>
              ))
            )}
          </div>
          <DropdownSeparator />
          <div className="p-2 text-center">
            <button
              onClick={() => navigate('/app/notifications')}
              className="w-full text-center text-xs font-bold text-brand-navy dark:text-brand-orange hover:underline py-1"
            >
              Voir toutes les notifications →
            </button>
          </div>
        </DropdownMenu>

        {user && (
          <DropdownMenu
            trigger={
              <button
                aria-label="Mon compte"
                className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <UserAvatar
                  name={`${user.prenom || ''} ${user.nom || ''}`}
                  roleRing={String(user.role || '').toLowerCase().includes('admin') ? 'admin' : String(user.role || '').toLowerCase().includes('partner') ? 'partner' : 'user'}
                  size="sm"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-title">
                    {user.prenom} {user.nom}
                  </p>
                </div>
                <Icon icon="solar:alt-arrow-down-bold" className="text-xs text-slate-400" />
              </button>
            }
          >
            <div className="px-3 py-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white font-title">
                {user.prenom} {user.nom}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
            </div>
            <DropdownSeparator />
            <DropdownItem onClick={() => navigate('/app/profile')}>
              <Icon icon="solar:user-bold" className="text-base" />
              Mon Profil
            </DropdownItem>
            {isSuperAdmin && (
              <DropdownItem onClick={() => navigate('/app/settings')}>
                <Icon icon="solar:settings-bold" className="text-base" />
                Paramètres Système
              </DropdownItem>
            )}
            <DropdownSeparator />
            <DropdownItem onClick={handleLogout}>
              <Icon icon="solar:logout-2-bold" className="text-base text-red-500" />
              <span className="text-red-500">{t('actions.logout')}</span>
            </DropdownItem>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
