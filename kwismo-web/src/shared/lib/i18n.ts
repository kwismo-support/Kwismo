import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/config/env';
import { LANG_STORAGE_KEY } from '@/config/constants';


import frCommon  from '@/locales/fr/common.json';
import frLanding from '@/locales/fr/landing.json';
import frAuth    from '@/locales/fr/auth.json';
import frAdmin   from '@/locales/fr/admin.json';
import frPartner from '@/locales/fr/partner.json';
import frPartnerRequest from '@/locales/fr/partnerRequest.json';
import frUser    from '@/locales/fr/user.json';
import frErrors  from '@/locales/fr/errors.json';


import enCommon  from '@/locales/en/common.json';
import enLanding from '@/locales/en/landing.json';
import enAuth    from '@/locales/en/auth.json';
import enAdmin   from '@/locales/en/admin.json';
import enPartner from '@/locales/en/partner.json';
import enPartnerRequest from '@/locales/en/partnerRequest.json';
import enUser    from '@/locales/en/user.json';
import enErrors  from '@/locales/en/errors.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng:         env.defaultLang,
    fallbackLng: 'fr',
    debug:       false,
    ns:          ['common', 'landing', 'auth', 'admin', 'partner', 'partnerRequest', 'user', 'errors'],
    defaultNS:   'common',
    detection: {
      order:  ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
    resources: {
      fr: { common: frCommon, landing: frLanding, auth: frAuth, admin: frAdmin, partner: frPartner, partnerRequest: frPartnerRequest, user: frUser, errors: frErrors },
      en: { common: enCommon, landing: enLanding, auth: enAuth, admin: enAdmin, partner: enPartner, partnerRequest: enPartnerRequest, user: enUser, errors: enErrors },
    },
    interpolation: { escapeValue: false },
  });

export { i18next as i18n };
