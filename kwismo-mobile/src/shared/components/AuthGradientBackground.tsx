import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

export interface AuthGradientBackgroundProps {
  children?: React.ReactNode;
  variant?: 'default' | 'mirror';
}

const LIGHT_AUTH_GRADIENT_COLORS: readonly [string, string, ...string[]] = [
  '#25B46E',
  '#2EB372',
  '#3FA37C',
  '#5C8E8B',
  '#8096A4',
  '#ABB6C3',
  '#D7DEE5',
  '#F4F6F8',
  '#FFFFFF',
  '#FFFFFF',
];

const DARK_AUTH_GRADIENT_COLORS: readonly [string, string, ...string[]] = [
  '#25B46E',
  '#229E61',
  '#1E8453',
  '#1A6B45',
  '#175439',
  '#15412F',
  '#123026',
  '#10231F',
  '#0F1626',
  '#0F1626',
];

const AUTH_GRADIENT_LOCATIONS: readonly [number, number, ...number[]] = [
  0.0,
  0.25,
  0.30,
  0.40,
  0.45,
  0.50,
  0.55,
  0.60,
  0.70,
  1.0,
];

export const AuthGradientBackground: React.FC<AuthGradientBackgroundProps> = ({
  children,
  variant = 'default',
}) => {
  const { isDark } = useAppTheme();
  const gradientColors = isDark ? DARK_AUTH_GRADIENT_COLORS : LIGHT_AUTH_GRADIENT_COLORS;

  if (variant === 'mirror') {
    return (
      <View className="flex-1 w-full h-full bg-white dark:bg-brand-darkBg relative">
        <View className="absolute inset-0" pointerEvents="none">
          <View className="absolute top-0 left-0 right-0 h-[42%]">
            <LinearGradient
              colors={gradientColors}
              locations={AUTH_GRADIENT_LOCATIONS}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.85, y: 0.55 }}
              className="absolute inset-0"
            />
          </View>
          <View className="absolute bottom-0 left-0 right-0 h-[42%]">
            <LinearGradient
              colors={gradientColors}
              locations={AUTH_GRADIENT_LOCATIONS}
              start={{ x: 0.85, y: 1.0 }}
              end={{ x: 0.0, y: 0.45 }}
              className="absolute inset-0"
            />
          </View>
        </View>
        {children}
      </View>
    );
  }

  return (
    <View className="flex-1 w-full h-full bg-white dark:bg-brand-darkBg relative">
      <View className="absolute inset-0" pointerEvents="none">
        <LinearGradient
          colors={gradientColors}
          locations={AUTH_GRADIENT_LOCATIONS}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 0.85, y: 0.55 }}
          className="absolute inset-0"
        />
      </View>
      {children}
    </View>
  );
};

export default AuthGradientBackground;


