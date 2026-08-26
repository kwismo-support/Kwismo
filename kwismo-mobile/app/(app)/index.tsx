import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function DashboardHomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Background Soft Gradient matching Image 5 */}
      <LinearGradient
        colors={['#162D29', '#2E4C46', '#87A9A0', '#E5EFEA', '#FFFFFF', '#459E87']}
        locations={[0, 0.25, 0.45, 0.65, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Right Language Switcher */}
      <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      {/* Center "Welcome" Typography */}
      <View style={styles.centerContainer}>
        <Text style={styles.welcomeText}>{t('common.welcome')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontFamily: fonts.h1,
    fontSize: 48,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: -0.5,
  },
});
