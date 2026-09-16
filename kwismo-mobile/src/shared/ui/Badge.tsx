import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info', className = '' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-emerald-100 dark:bg-emerald-950/60',
          text: 'text-brand-green dark:text-emerald-300',
        };
      case 'warning':
        return {
          container: 'bg-amber-100 dark:bg-amber-950/60',
          text: 'text-amber-800 dark:text-amber-300',
        };
      case 'error':
        return {
          container: 'bg-red-100 dark:bg-red-950/60',
          text: 'text-red-700 dark:text-red-300',
        };
      default:
        return {
          container: 'bg-slate-200 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
        };
    }
  };

  const { container, text } = getVariantClasses();

  return (
    <View className={`px-2 py-1 rounded-md self-start ${container} ${className}`}>
      <Text className={`font-bold text-2xs ${text}`}>{label}</Text>
    </View>
  );
};
