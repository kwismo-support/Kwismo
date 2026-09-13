import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Icon } from '../ui/Icon';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme } = useAppTheme();

  return (
    <TouchableOpacity style={styles.btn} onPress={() => setTheme(isDark ? 'light' : 'dark')} activeOpacity={0.7}>
      <Icon name={isDark ? 'solar:sun-bold' : 'solar:moon-bold'} size={20} color={isDark ? '#F59E0B' : '#0F172A'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 8,
  },
});
