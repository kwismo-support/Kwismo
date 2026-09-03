import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function OtpSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { t } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const isLoginMode = params.mode === 'login';

  const welcomeText = isLoginMode
    ? t('auth.otpWelcomeBackTitle', 'Bon retour parmi nous')
    : t('auth.otpSuccessTitle', 'Bienvenue');

  useEffect(() => {
    // Animation d'entrée fluide (Fade & Scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirection automatique vers l'application au bout de 1,8s
    const timer = setTimeout(() => {
      router.replace('/(app)');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dégradé d'arrière-plan fidèle à la maquette designer Verification_OTP_Succes.png */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[
            '#14532D',
            '#166534',
            '#15803D',
            '#22C55E',
            '#4ADE80',
            '#86EFAC',
            '#DCFCE7',
            '#FFFFFF',
            '#FFFFFF',
            '#F0FDF4',
            '#DCFCE7',
            '#86EFAC',
            '#22C55E',
          ]}
          locations={[0, 0.1, 0.22, 0.35, 0.45, 0.52, 0.6, 0.68, 0.76, 0.84, 0.9, 0.95, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Texte Stylisé Orange "Bienvenue" ou "Bon retour parmi nous" centré au milieu */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text style={styles.welcomeTextTitle}>
            {welcomeText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeTextTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(42),
    fontWeight: '900',
    color: colors.orange,
    textAlign: 'center',
    letterSpacing: -0.5,
    elevation: 4,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});
