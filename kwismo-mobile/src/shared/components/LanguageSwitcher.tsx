import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import i18n from '@/locales/i18n';

interface LanguageSwitcherProps {
  darkTheme?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ darkTheme = true }) => {
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'fr');

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <View
      className={`flex-row items-center rounded-full px-1.5 py-1 border-1.5 ${
        darkTheme
          ? 'bg-slate-900/75 border-slate-700/60 dark:bg-slate-900/75'
          : 'bg-white/90 border-slate-300 dark:bg-slate-800/90'
      }`}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleLanguage('fr')}
        className={`px-3 py-1 rounded-full ${
          currentLang === 'fr' ? 'bg-brand-orange' : 'bg-transparent'
        }`}
      >
        <Text
          className={`font-caption text-sm font-semibold ${
            currentLang === 'fr'
              ? 'text-white'
              : darkTheme
              ? 'text-white'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          FR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleLanguage('en')}
        className={`px-3 py-1 rounded-full ${
          currentLang === 'en' ? 'bg-brand-orange' : 'bg-transparent'
        }`}
      >
        <Text
          className={`font-caption text-sm font-semibold ${
            currentLang === 'en'
              ? 'text-white'
              : darkTheme
              ? 'text-white'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSwitcher;
