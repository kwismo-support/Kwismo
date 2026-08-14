import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_STORAGE_KEY } from '@/config/constants';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme:   Theme;
  toggle:  () => void;
  setTheme:(theme: Theme) => void;
}

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),

      toggle: () =>
        set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

      setTheme: (theme) => set({ theme }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
