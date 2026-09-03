import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from '../../src/shared/components/KwismoLogo';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { AuthDomeBackground } from '../../src/shared/components/AuthDomeBackground';
import { colors, fonts } from '../../src/styles/tokens';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <AuthDomeBackground>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Sélecteur de langue en haut à droite */}
        <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
          <LanguageSwitcher darkTheme={true} />
        </View>

        {/* Logo Kwismo centré sur le dôme */}
        <View style={styles.centerContainer}>
          <KwismoLogo size={200} variant="white" />
        </View>

        {/* Boutons d'action en bas de page */}
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
            <Text style={styles.loginText}>{t('common.login', 'Se connecter')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerText}>{t('common.register', 'Créer un compte')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthDomeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: fonts.headlineBold,
    fontSize: 16,
    fontWeight: '700',
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
    fontFamily: fonts.headlineBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#3B4E7A',
  },
});