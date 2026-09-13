import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: '#DCFCE7', text: '#16A34A' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'error':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#E2E8F0', text: '#334155' };
    }
  };

  const style = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
