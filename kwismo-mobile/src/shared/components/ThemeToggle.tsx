import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { Icon } from '@/shared/ui/Icon';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme } = useAppTheme();

  return (
    <TouchableOpacity className="p-2" onPress={() => setTheme(isDark ? 'light' : 'dark')} activeOpacity={0.7}>
      <Icon name={isDark ? 'solar:sun-bold' : 'solar:moon-bold'} size={20} color={isDark ? '#F59E0B' : '#0F172A'} />
    </TouchableOpacity>
  );
};

export default ThemeToggle;
