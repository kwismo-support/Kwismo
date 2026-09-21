import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useNavAnimationStore } from '@/shared/store/navAnimationStore';
import { colors } from '@/styles/tokens';

export type TabRoute = 'home' | 'management' | 'transfer' | 'profile';

interface TabBarProps {
  activeTab?: TabRoute;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { setTabNavigation } = useNavAnimationStore();

  const currentTab: TabRoute = activeTab || (
    pathname.includes('management') ? 'management' :
    pathname.includes('transfer') ? 'transfer' :
    pathname.includes('profile') ? 'profile' : 'home'
  );

  const activeColor = isDark ? colors.white : '#161E33';

  const handleTabPress = (routePath: string, tabName: TabRoute) => {
    if (currentTab === tabName) return;
    setTabNavigation(tabName);
    router.push(routePath as any);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-50 flex-row items-center justify-around pt-2.5 bg-white dark:bg-brand-cardDark border-0 border-slate-200 dark:border-slate-700/60 shadow-md elevation-5"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleTabPress('/(app)', 'home')}
        className="items-center justify-center flex-1 py-1"
      >
        <Icon
          name={currentTab === 'home' ? 'solar:home-smile-bold' : 'solar:home-smile-linear'}
          size={24}
          color={currentTab === 'home' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          className={`text-2xs mt-1 ${
            currentTab === 'home'
              ? 'font-bold text-slate-900 dark:text-white'
              : 'font-medium text-slate-400 dark:text-slate-500'
          }`}
        >
          {t('common.home')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleTabPress('/(app)/management', 'management')}
        className="items-center justify-center flex-1 py-1"
      >
        <Icon
          name={currentTab === 'management' ? 'solar:user-id-bold' : 'solar:user-id-linear'}
          size={24}
          color={currentTab === 'management' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          className={`text-2xs mt-1 ${
            currentTab === 'management'
              ? 'font-bold text-slate-900 dark:text-white'
              : 'font-medium text-slate-400 dark:text-slate-500'
          }`}
        >
          {t('common.management')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleTabPress('/(app)/transfer', 'transfer')}
        className="items-center justify-center flex-1 py-1"
      >
        <Icon
          name={currentTab === 'transfer' ? 'solar:card-transfer-bold' : 'solar:card-transfer-linear'}
          size={24}
          color={currentTab === 'transfer' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          className={`text-2xs mt-1 ${
            currentTab === 'transfer'
              ? 'font-bold text-slate-900 dark:text-white'
              : 'font-medium text-slate-400 dark:text-slate-500'
          }`}
        >
          {t('common.transfer')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleTabPress('/(app)/profile', 'profile')}
        className="items-center justify-center flex-1 py-1"
      >
        <Icon
          name={currentTab === 'profile' ? 'solar:user-bold' : 'solar:user-linear'}
          size={24}
          color={currentTab === 'profile' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          className={`text-2xs mt-1 ${
            currentTab === 'profile'
              ? 'font-bold text-slate-900 dark:text-white'
              : 'font-medium text-slate-400 dark:text-slate-500'
          }`}
        >
          {t('common.profile')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabBar;
