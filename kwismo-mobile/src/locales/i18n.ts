import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import frCommon from './fr/common.json';
import frAuth from './fr/auth.json';
import frApp from './fr/app.json';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enApp from './en/app.json';

const resources = {
  fr: {
    translation: {
      ...frCommon,
      ...frAuth,
      ...frApp,
    },
  },
  en: {
    translation: {
      ...enCommon,
      ...enAuth,
      ...enApp,
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
