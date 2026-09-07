import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Hash, Building2,
  PhoneCall, ShieldCheck, FileBarChart, User, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { ROLES } from '@/config/constants';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  open:    boolean;
  onClose: () => void;
}

interface NavItem {
  to:    string;
  icon:  React.ReactNode;
  label: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', icon: <LayoutDashboard size={18} />, label: 'nav.dashboard' },
  { to: '/app/numbers',   icon: <Hash            size={18} />, label: 'nav.numbers'   },
  { to: '/app/reports',   icon: <FileBarChart     size={18} />, label: 'nav.reports'   },
  { to: '/app/user',      icon: <User             size={18} />, label: 'nav.userPortal'},
  { to: '/app/users',     icon: <Users            size={18} />, label: 'nav.users',    roles: [ROLES.ADMIN] },
  { to: '/app/partners',  icon: <Building2        size={18} />, label: 'nav.partners', roles: [ROLES.ADMIN] },
  { to: '/app/ussd',      icon: <PhoneCall        size={18} />, label: 'nav.ussd',     roles: [ROLES.ADMIN] },
  { to: '/app/access',    icon: <ShieldCheck      size={18} />, label: 'nav.access',   roles: [ROLES.ADMIN] },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('common');
  const user   = useAuthStore((s) => s.user);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside
      aria-label="Navigation principale"
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--color-border)]',
        'bg-[var(--color-bg-subtle)] transition-transform duration-300',
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {}
      <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--color-border)]">
        <span className="text-xl font-bold text-primary-500 tracking-tight">KWISMO</span>
        <button
          onClick={onClose}
          aria-label="Fermer le menu"
          className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]',
                  )
                }
              >
                {item.icon}
                {t(item.label) || item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
