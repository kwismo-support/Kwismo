import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={cn(
        'rounded-full p-2 text-[var(--color-text-muted)]',
        'hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors',
        className,
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
