import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/config/env';
import { LANG_STORAGE_KEY } from '@/config/constants';

/* ── Traductions FR ──────────────────────────────────────── */
import frCommon  from '@/locales/fr/common.json';
import frLanding from '@/locales/fr/landing.json';
import frAuth    from '@/locales/fr/auth.json';
import frAdmin   from '@/locales/fr/admin.json';
import frPartner from '@/locales/fr/partner.json';

/* ── Traductions EN ──────────────────────────────────────── */
import enCommon  from '@/locales/en/common.json';
import enLanding from '@/locales/en/landing.json';
import enAuth    from '@/locales/en/auth.json';
import enAdmin   from '@/locales/en/admin.json';
import enPartner from '@/locales/en/partner.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng:         env.defaultLang,
    fallbackLng: 'fr',
    debug:       false,
    ns:          ['common', 'landing', 'auth', 'admin', 'partner'],
    defaultNS:   'common',
    detection: {
      order:  ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
    resources: {
      fr: { common: frCommon, landing: frLanding, auth: frAuth, admin: frAdmin, partner: frPartner },
      en: { common: enCommon, landing: enLanding, auth: enAuth, admin: enAdmin, partner: enPartner },
    },
    interpolation: { escapeValue: false },
  });

export { i18next as i18n };
