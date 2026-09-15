import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';

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

  const currentTab: TabRoute = activeTab || (
    pathname.includes('management') ? 'management' :
    pathname.includes('transfer') ? 'transfer' :
    pathname.includes('profile') ? 'profile' : 'home'
  );

  const activeColor = isDark ? colors.white : '#161E33';

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-[1000] flex-row items-center justify-around pt-2.5 border-t shadow-md elevation-5"
      style={{
        backgroundColor: themeColors.cardBg,
        borderTopColor: themeColors.inputBorder,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)')}
        className="items-center justify-center flex-1 space-y-1"
      >
        <Icon
          name={currentTab === 'home' ? 'solar:home-2-bold' : 'solar:home-2-linear'}
          size={24}
          color={currentTab === 'home' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={{
            fontFamily: currentTab === 'home' ? fonts.semiBold : fonts.medium,
            fontWeight: currentTab === 'home' ? '700' : '500',
            fontSize: 11,
            color: currentTab === 'home' ? activeColor : themeColors.inputPlaceholder,
          }}
        >
          {t('common.home')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/management')}
        className="items-center justify-center flex-1 space-y-1"
      >
        <Icon
          name={currentTab === 'management' ? 'solar:user-id-bold' : 'solar:user-id-linear'}
          size={24}
          color={currentTab === 'management' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={{
            fontFamily: currentTab === 'management' ? fonts.semiBold : fonts.medium,
            fontWeight: currentTab === 'management' ? '700' : '500',
            fontSize: 11,
            color: currentTab === 'management' ? activeColor : themeColors.inputPlaceholder,
          }}
        >
          {t('common.management')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/transfer')}
        className="items-center justify-center flex-1 space-y-1"
      >
        <Icon
          name={currentTab === 'transfer' ? 'solar:card-transfer-bold' : 'solar:card-transfer-linear'}
          size={24}
          color={currentTab === 'transfer' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={{
            fontFamily: currentTab === 'transfer' ? fonts.semiBold : fonts.medium,
            fontWeight: currentTab === 'transfer' ? '700' : '500',
            fontSize: 11,
            color: currentTab === 'transfer' ? activeColor : themeColors.inputPlaceholder,
          }}
        >
          {t('common.transfer')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/profile')}
        className="items-center justify-center flex-1 space-y-1"
      >
        <Icon
          name={currentTab === 'profile' ? 'solar:user-bold' : 'solar:user-linear'}
          size={24}
          color={currentTab === 'profile' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={{
            fontFamily: currentTab === 'profile' ? fonts.semiBold : fonts.medium,
            fontWeight: currentTab === 'profile' ? '700' : '500',
            fontSize: 11,
            color: currentTab === 'profile' ? activeColor : themeColors.inputPlaceholder,
          }}
        >
          {t('common.profile')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabBar;

