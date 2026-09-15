import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface BrandGradientBackgroundProps {
  children?: React.ReactNode;
}

export const BrandGradientBackground: React.FC<BrandGradientBackgroundProps> = ({ children }) => {
  return (
    <View className="flex-1 w-full h-full bg-brand-green relative">
      <LinearGradient
        colors={[
          '#20B377',
          '#20B377',
          '#2E4750',
          '#39505A',
          '#8BA0B5',
          '#CBD7E3',
          '#FFFFFF',
        ]}
        locations={[0.0, 0.35, 0.52, 0.62, 0.74, 0.84, 1.0]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

export default BrandGradientBackground;
