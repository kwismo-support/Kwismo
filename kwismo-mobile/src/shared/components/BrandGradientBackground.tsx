import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

export interface BrandGradientBackgroundProps {
  children?: React.ReactNode;
}

const DARK_BRAND_COLORS: readonly [string, string, ...string[]] = ['#20B377', '#20B377', '#1E353D', '#1B2C36', '#162330', '#121B26', '#0F1626'];
const LIGHT_BRAND_COLORS: readonly [string, string, ...string[]] = ['#20B377', '#20B377', '#2E4750', '#39505A', '#8BA0B5', '#CBD7E3', '#FFFFFF'];

export const BrandGradientBackground: React.FC<BrandGradientBackgroundProps> = ({ children }) => {
  const { isDark } = useAppTheme();
  const colorsList = isDark ? DARK_BRAND_COLORS : LIGHT_BRAND_COLORS;

  return (
    <View className="flex-1 w-full h-full bg-white dark:bg-brand-darkBg relative">
      <LinearGradient
        colors={colorsList}
        locations={[0.0, 0.35, 0.52, 0.62, 0.74, 0.84, 1.0]}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
};

export default BrandGradientBackground;


