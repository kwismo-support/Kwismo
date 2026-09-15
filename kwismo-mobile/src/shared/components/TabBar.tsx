import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';

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
      style={[
        styles.tabBar,
        {
          backgroundColor: themeColors.cardBg,
          borderTopColor: themeColors.inputBorder,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)')}
        style={styles.tabItem}
      >
        <Icon
          name={currentTab === 'home' ? 'solar:home-2-bold' : 'solar:home-2-linear'}
          size={24}
          color={currentTab === 'home' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'home' ? activeColor : themeColors.inputPlaceholder },
            currentTab === 'home' && styles.tabLabelActive,
          ]}
        >
          {t('common.home')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/management')}
        style={styles.tabItem}
      >
        <Icon
          name={currentTab === 'management' ? 'solar:user-id-bold' : 'solar:user-id-linear'}
          size={24}
          color={currentTab === 'management' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'management' ? activeColor : themeColors.inputPlaceholder },
            currentTab === 'management' && styles.tabLabelActive,
          ]}
        >
          {t('common.management')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/transfer')}
        style={styles.tabItem}
      >
        <Icon
          name={currentTab === 'transfer' ? 'solar:card-transfer-bold' : 'solar:card-transfer-linear'}
          size={24}
          color={currentTab === 'transfer' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'transfer' ? activeColor : themeColors.inputPlaceholder },
            currentTab === 'transfer' && styles.tabLabelActive,
          ]}
        >
          {t('common.transfer')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.replace('/(app)/profile')}
        style={styles.tabItem}
      >
        <Icon
          name={currentTab === 'profile' ? 'solar:user-bold' : 'solar:user-linear'}
          size={24}
          color={currentTab === 'profile' ? activeColor : themeColors.inputPlaceholder}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'profile' ? activeColor : themeColors.inputPlaceholder },
            currentTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          {t('common.profile')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(11),
  },
  tabLabelActive: {
    fontFamily: fonts.semiBold,
    fontWeight: '700',
  },
});
