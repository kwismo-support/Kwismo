import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';

export default function OtpSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { t } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const isLoginMode = params.mode === 'login';
  const welcomeText = isLoginMode ? t('auth.otpWelcomeBackTitle') : t('auth.otpSuccessTitle');

  useEffect(() => {
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

    const timer = setTimeout(() => {
      router.replace('/(app)');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthGradientBackground variant="mirror">
      <StatusBar style="light" />

      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text className="font-montserrat-bold text-4xl text-brand-orange text-center tracking-tight">
            {welcomeText}
          </Text>
        </Animated.View>
      </View>
    </AuthGradientBackground>
  );
}
