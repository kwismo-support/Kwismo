import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from './KwismoLogo';

interface CustomAnimatedSplashProps {
  onFinish?: () => void;
}

export const CustomAnimatedSplash: React.FC<CustomAnimatedSplashProps> = ({ onFinish }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onFinish) {
        setTimeout(onFinish, 400);
      }
    });
  }, []);

  const bgColor = isDark ? '#0F1626' : '#FFFFFF';
  const logoVariant = isDark ? 'white' : 'default';
  const textColor = isDark ? '#FFFFFF' : '#0F2B24';
  const subtitleColor = isDark ? '#A0AEC0' : '#4A5568';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <KwismoLogo size={180} variant={logoVariant} />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={[styles.title, { color: textColor }]}>KWISMO</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {t('splash.subtitle')}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'MontserratAlternates-Bold',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Ageo-Medium',
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
