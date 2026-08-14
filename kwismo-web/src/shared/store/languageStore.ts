import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { i18n } from '@/shared/lib/i18n';
import { LANG_STORAGE_KEY, SUPPORTED_LANGS, DEFAULT_LANG } from '@/config/constants';
import type { SupportedLang } from '@/config/constants';

interface LanguageState {
  lang:    SupportedLang;
  setLang: (lang: SupportedLang) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: DEFAULT_LANG,

      setLang: (lang) => {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        i18n.changeLanguage(lang);
        set({ lang });
      },
    }),
    { name: LANG_STORAGE_KEY },
  ),
);
