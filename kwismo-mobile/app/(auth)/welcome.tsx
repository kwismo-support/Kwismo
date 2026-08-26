import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      {/* Background Gradient matching Image 2 */}
      <LinearGradient
        colors={['#32B07F', '#248563', '#1C433D', '#161E33', '#161E33']}
        locations={[0, 0.3, 0.55, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top right language switcher */}
      <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      {/* Center Kwismo Logo */}
      <View style={styles.centerContainer}>
        <KwismoLogo size={150} variant="white" />
      </View>

      {/* Bottom Action Buttons matching Image 2 */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
      >
        {/* Filled Orange Button: Se connecter */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>{t('common.login')}</Text>
        </TouchableOpacity>

        {/* Outline Button: Créer un compte */}
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
    backgroundColor: colors.navy,
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
  bottomContainer: {
    paddingHorizontal: 24,
    gap: 16,
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
    shadowOpacity: 0.15,
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
    borderColor: '#3B5284',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#3B5284',
  },
});
