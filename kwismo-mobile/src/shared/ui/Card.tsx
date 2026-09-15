import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <View
      style={style}
      className={`bg-white dark:bg-brand-cardDark rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm ${className}`}
    >
      {children}
    </View>
  );
};
