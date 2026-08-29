import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
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
  const { width: screenWidth } = useWindowDimensions();

  const dynamicLogoSize = Math.min(Math.max(screenWidth * 0.6, 200), 280);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          '#2BB673',
          '#28A86B',
          '#249460',
          '#207D53',
          '#1E6548',
          '#1D4D40',
          '#1C3740',
          '#65798C',
          '#C5CFD8',
          '#FFFFFF',
        ]}
        locations={[0, 0.2, 0.35, 0.48, 0.58, 0.68, 0.78, 0.84, 0.88, 0.92]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
        <LanguageSwitcher darkTheme={true} />
      </View>

      <View style={styles.centerContainer}>
        <KwismoLogo size={dynamicLogoSize} variant="white" />
      </View>

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
  },
  bottomContainer: {
    paddingHorizontal: 24,
    gap: 14,
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
