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

      {/* Clear, visible separator bar */}
      <View
        style={[
          styles.dividerBar,
          darkTheme ? styles.dividerDark : styles.dividerLight,
        ]}
      />

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
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  containerDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(22, 30, 51, 0.25)',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  btnActive: {
    backgroundColor: colors.orange,
  },
  dividerBar: {
    width: 1.5,
    height: 16,
    marginHorizontal: 2,
  },
  dividerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dividerLight: {
    backgroundColor: 'rgba(22, 30, 51, 0.35)',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLight: {
    color: colors.navy,
  },
  textActive: {
    color: '#FFFFFF',
  },
});
