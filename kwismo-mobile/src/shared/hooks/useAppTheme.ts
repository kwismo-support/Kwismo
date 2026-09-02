import { useColorScheme } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, ThemePreference } from '../store/themeStore';
import { colors } from '../../styles/tokens';

export interface AppThemeColors {
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  divider: string;
  primaryOrange: string;
  primaryGreen: string;
  secondaryBorder: string;
  secondaryText: string;
  disabled: string;
  disabledText: string;
}

export function useAppTheme() {
  const systemColorScheme = useColorScheme() || 'light';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userThemePreference = useThemeStore((state) => state.userThemePreference);
  const setTheme = useThemeStore((state) => state.setTheme);

  let activeTheme: 'light' | 'dark' = systemColorScheme as 'light' | 'dark';

  if (userThemePreference === 'dark') {
    activeTheme = 'dark';
  } else if (userThemePreference === 'light') {
    activeTheme = 'light';
  } else {
    activeTheme = (systemColorScheme === 'dark' ? 'dark' : 'light');
  }

  const isDark = activeTheme === 'dark';

  const themeColors: AppThemeColors = {
    background: isDark ? '#0F1626' : '#FFFFFF',
    cardBg: isDark ? '#162035' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#94A3B8' : '#6B7280',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(229, 231, 235, 0.9)',
    inputPlaceholder: isDark ? '#94A3B8' : '#A0AEC0',
    divider: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E5E7EB',
    primaryOrange: colors.orange,
    primaryGreen: colors.green,
    secondaryBorder: isDark ? 'rgba(255, 255, 255, 0.7)' : '#3B4E7A',
    secondaryText: isDark ? '#FFFFFF' : '#3B4E7A',
    disabled: isDark ? '#334155' : colors.disabled,
    disabledText: isDark ? '#64748B' : colors.disabledText,
  };

  return {
    theme: activeTheme,
    isDark,
    colors: themeColors,
    setTheme,
  };
}
