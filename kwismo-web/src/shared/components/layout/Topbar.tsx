import { Menu, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/shared/ui/dropdown-menu';
import { useAuthStore } from '@/shared/store/authStore';
import { Breadcrumb } from './Breadcrumb';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t }    = useTranslation('common');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 sm:px-6">
      {}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="rounded p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] lg:hidden"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      {}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />

        {user && (
          <DropdownMenu
            trigger={
              <button
                aria-label="Mon compte"
                className="flex items-center gap-2 rounded-full p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <User size={20} />
                <span className="hidden text-sm font-medium sm:inline text-[var(--color-text)]">
                  {user.prenom}
                </span>
              </button>
            }
          >
            <div className="px-3 py-2 text-xs text-[var(--color-text-muted)]">
              {user.prenom} {user.nom}
            </div>
            <DropdownSeparator />
            <DropdownItem onClick={handleLogout}>
              <LogOut size={14} />
              {t('actions.logout')}
            </DropdownItem>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
