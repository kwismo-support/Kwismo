import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '../../locales/i18n';
import { colors, fonts } from '../../styles/tokens';

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
      style={[
        styles.container,
        darkTheme ? styles.containerDark : styles.containerLight,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleLanguage('fr')}
        style={[
          styles.btn,
          currentLang === 'fr' && styles.btnActive,
        ]}
      >
        <Text
          style={[
            styles.text,
            darkTheme ? styles.textDark : styles.textLight,
            currentLang === 'fr' && styles.textActive,
          ]}
        >
          FR
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleLanguage('en')}
        style={[
          styles.btn,
          currentLang === 'en' && styles.btnActive,
        ]}
      >
        <Text
          style={[
            styles.text,
            darkTheme ? styles.textDark : styles.textLight,
            currentLang === 'en' && styles.textActive,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
  },
  containerDark: {
    backgroundColor: 'rgba(22, 30, 51, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(22, 30, 51, 0.15)',
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  btnActive: {
    backgroundColor: colors.orange,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  textDark: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  textLight: {
    color: colors.navy,
  },
  textActive: {
    color: colors.white,
  },
});
