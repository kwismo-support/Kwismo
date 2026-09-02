import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KwismoLogo } from '../src/shared/components/KwismoLogo';
import { SplashBackgroundDecorations } from '../src/shared/components/SplashBackgroundDecorations';
import { LanguageSwitcher } from '../src/shared/components/LanguageSwitcher';
import { colors } from '../src/styles/tokens';

export default function SplashScreenPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
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
      router.replace('/onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <View style={styles.container}>
      {/* Background vector motifs */}
      <SplashBackgroundDecorations />

      {/* Top right language switcher */}
      <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
        <LanguageSwitcher darkTheme={false} />
      </View>

      {/* Centered Kwismo Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <KwismoLogo size={150} variant="default" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
