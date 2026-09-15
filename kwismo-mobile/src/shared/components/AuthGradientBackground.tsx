import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface AuthGradientBackgroundProps {
  children?: React.ReactNode;
  variant?: 'default' | 'mirror';
}

const AUTH_GRADIENT_COLORS: readonly [string, string, ...string[]] = [
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
  if (variant === 'mirror') {
    return (
      <View className="flex-1 w-full h-full bg-white relative">
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42%' }}>
            <LinearGradient
              colors={AUTH_GRADIENT_COLORS}
              locations={AUTH_GRADIENT_LOCATIONS}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.85, y: 0.55 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%' }}>
            <LinearGradient
              colors={AUTH_GRADIENT_COLORS}
              locations={AUTH_GRADIENT_LOCATIONS}
              start={{ x: 0.85, y: 1.0 }}
              end={{ x: 0.0, y: 0.45 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
        {children}
      </View>
    );
  }

  return (
    <View className="flex-1 w-full h-full bg-white relative">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={AUTH_GRADIENT_COLORS}
          locations={AUTH_GRADIENT_LOCATIONS}
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 0.85, y: 0.55 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {children}
    </View>
  );
};

export default AuthGradientBackground;
