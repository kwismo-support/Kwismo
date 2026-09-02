import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from '../../src/shared/components/KwismoLogo';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full-width vertical linear gradient - smooth fade from emerald green top to navy slate middle to pure white bottom */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[
            '#2BB673',
            '#28A86B',
            '#249460',
            '#213E35',
            '#23303B',
            '#2A3742',
            '#3C4A56',
            '#60707F',
            '#98A8B8',
            '#D8E2EC',
            '#FFFFFF',
            '#FFFFFF',
          ]}
          locations={[0, 0.10, 0.20, 0.30, 0.38, 0.46, 0.53, 0.60, 0.66, 0.72, 0.76, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Top right language switcher */}
      <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      {/* Centered Kwismo Logo */}
      <View style={styles.centerContainer}>
        <KwismoLogo size={200} variant="white" />
      </View>

      {/* Bottom action buttons */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>{t('common.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.registerButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerText}>{t('common.register')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    zIndex: 10,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    gap: 14,
    width: '100%',
    zIndex: 10,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: colors.orange,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#3B4E7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#3B4E7A',
  },
});