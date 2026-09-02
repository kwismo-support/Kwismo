import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  userThemePreference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  userThemePreference: 'system',
  setTheme: (preference) => set({ userThemePreference: preference }),
}));
