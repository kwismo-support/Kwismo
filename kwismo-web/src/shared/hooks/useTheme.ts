import { useThemeStore } from '@/shared/store/themeStore';

/**
 * Hook pratique pour accéder au thème et le modifier.
 */
export function useTheme() {
  const theme   = useThemeStore((s) => s.theme);
  const toggle  = useThemeStore((s) => s.toggle);
  const setTheme = useThemeStore((s) => s.setTheme);

  return { theme, isDark: theme === 'dark', toggle, setTheme };
}
