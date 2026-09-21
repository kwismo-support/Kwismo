import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  Modal,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderActions } from '@/shared/components/HeaderActions';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { colors } from '@/styles/tokens';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
  backgroundColor?: string;
  textColor?: string;
  rightAction?: React.ReactNode;
}

interface SearchCategory {
  id: string;
  label: string;
  icon: string;
}

interface SearchItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  isHome = false,
  showBack = false,
  onBack,
  unreadNotificationsCount = 0,
  onPressNotifications,
  backgroundColor = colors.green,
  textColor = colors.white,
  rightAction,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const categoryChips: SearchCategory[] = useMemo(
    () => [
      { id: 'all', label: t('common.searchAll'), icon: 'solar:stars-bold' },
      { id: 'transfer', label: t('common.actionTransfer'), icon: 'solar:card-send-bold' },
      { id: 'report', label: t('common.report'), icon: 'solar:danger-triangle-bold' },
      { id: 'whatsapp', label: t('common.actionWhatsapp'), icon: 'solar:chat-round-dots-bold' },
      { id: 'contacts', label: t('common.myContacts'), icon: 'solar:users-group-two-rounded-bold' },
      { id: 'sim', label: t('common.myNumbers'), icon: 'solar:sim-cards-bold' },
      { id: 'security', label: t('common.security'), icon: 'solar:shield-keyhole-bold' },
    ],
    [t]
  );

  const searchIndex: SearchItem[] = useMemo(
    () => [
      {
        id: 's-1',
        category: 'transfer',
        title: t('common.searchTransferTitle'),
        subtitle: t('common.searchTransferSub'),
        icon: 'solar:card-send-bold',
        route: '/(app)/transfer',
      },
      {
        id: 's-2',
        category: 'report',
        title: t('common.searchReportTitle'),
        subtitle: t('common.searchReportSub'),
        icon: 'solar:danger-triangle-bold',
        route: '/(app)/report',
      },
      {
        id: 's-3',
        category: 'whatsapp',
        title: t('common.searchWhatsappTitle'),
        subtitle: t('common.searchWhatsappSub'),
        icon: 'solar:chat-round-dots-bold',
        route: '/(app)/alert-whatsapp',
      },
      {
        id: 's-4',
        category: 'contacts',
        title: t('common.searchContactsTitle'),
        subtitle: t('common.searchContactsSub'),
        icon: 'solar:users-group-two-rounded-bold',
        route: '/(app)/contacts',
      },
      {
        id: 's-5',
        category: 'sim',
        title: t('common.searchSimTitle'),
        subtitle: t('common.searchSimSub'),
        icon: 'solar:sim-cards-bold',
        route: '/(app)/management',
      },
      {
        id: 's-6',
        category: 'security',
        title: t('common.searchSecurityTitle'),
        subtitle: t('common.searchSecuritySub'),
        icon: 'solar:shield-keyhole-bold',
        route: '/(app)/two-factor',
      },
      {
        id: 's-7',
        category: 'security',
        title: t('common.searchSessionsTitle'),
        subtitle: t('common.searchSessionsSub'),
        icon: 'solar:devices-bold',
        route: '/(app)/active-sessions',
      },
      {
        id: 's-8',
        category: 'all',
        title: t('common.searchNotificationsTitle'),
        subtitle: t('common.searchNotificationsSub'),
        icon: 'solar:bell-bold',
        route: '/(app)/notifications',
      },
    ],
    [t]
  );

  const showVerticalResults = searchQuery.trim().length > 0 || selectedCategory !== 'all';

  const filteredResults = useMemo(() => {
    if (!showVerticalResults) return [];
    let items = searchIndex;
    if (selectedCategory !== 'all') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q)
      );
    }
    return items;
  }, [searchQuery, selectedCategory, searchIndex, showVerticalResults]);

  const handleSelectItem = (routePath: string) => {
    handleCloseSearch();
    router.push(routePath as any);
  };

  const headerHeightTop = Math.max(insets.top + 8, 18);

  return (
    <>
      <View
        style={{
          backgroundColor,
          paddingTop: headerHeightTop,
          paddingBottom: 30,
        }}
        className="px-4 pb-3 relative overflow-hidden"
      >
        <View className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <View className="absolute -top-10 -right-5 wx-55 hx-55 rounded-full border-[26px] border-white -rotate-25 scale-x-140" />
        </View>

        <View className="flex-row items-center justify-between min-h-7 mb-10">
          {showBack ? (
            <>
              <View className="wx-10 flex-row items-center justify-start">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleBack}
                  className="p-1.5 -ml-1"
                >
                  <Icon name="solar:arrow-left-linear" color={textColor} size={24} />
                </TouchableOpacity>
              </View>

              <View className="flex-1" />

              <View className="wx-10 flex-row items-center justify-end">
                {rightAction || null}
              </View>
            </>
          ) : (
            <>
              <View className="flex-1 justify-center">
                {isHome ? (
                  <Text style={{ color: textColor }} className="font-montserrat-bold text-2xl font-h1 tracking-wider">
                    KWISMO
                  </Text>
                ) : (
                  <Text numberOfLines={1} style={{ color: textColor }} className="font-montserrat-bold text-2xl font-h1 tracking-wider">
                    {title}
                  </Text>
                )}
              </View>

              <View className="wx-18 flex-row items-center justify-end">
                <HeaderActions
                  unreadNotificationsCount={unreadNotificationsCount}
                  iconColor={textColor}
                  onPressNotifications={onPressNotifications}
                  onPressSearch={() => setIsSearchActive(true)}
                  showBell={true}
                />
              </View>
            </>
          )}
        </View>

        {showBack && title && (
          <View className="items-center justify-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: textColor }}
              className="flex-1 justify-end items-end font-montserrat-bold text-2xl font-bold text-center"
            >
              {title}
            </Text>
          </View>
        )}

        {!showBack && subtitle && (
          <View className="items-center justify-center">
            <Text style={{ color: textColor }} className="font-semibold text-base text-center">
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={isSearchActive}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseSearch}
      >
        <View className="flex-1 bg-white dark:bg-brand-darkBg">
          <View
            style={{
              backgroundColor,
              paddingTop: headerHeightTop,
              paddingBottom: 16,
            }}
            className="px-4 relative overflow-hidden"
          >
            <View className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
              <View className="absolute -top-10 -right-5 wx-55 hx-55 rounded-full border-[26px] border-white -rotate-25 scale-x-140" />
            </View>

            <View className="flex-row items-center justify-between min-h-7">
              <View className="flex-1 flex-row items-center bg-white/20 rounded-full px-3.5 py-2.5 mr-2">
                <Icon name="bitcoin-icons:search-filled" color="#FFFFFF" size={24} className="mr-2" />
                <TextInput
                  autoFocus
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('common.searchPlaceholder')}
                  placeholderTextColor="rgba(255, 255, 255, 0.75)"
                  className="flex-1 font-medium text-white text-sm py-0 h-7"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="solar:close-circle-bold" color="#FFFFFF" size={24} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCloseSearch}
                className="p-1.5"
              >
                <Icon name="solar:close-linear" color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 px-4 pt-4">
            <View className="mb-4">
              <Text className="font-headline-bold text-2xs text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                {t('common.quickSuggestions')}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 8, paddingHorizontal: 8 }}
                className="flex-row"
              >
                {categoryChips.map((chip) => {
                  const isSelected = selectedCategory === chip.id;
                  return (
                    <TouchableOpacity
                      key={chip.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCategory(isSelected ? 'all' : chip.id)}
                      className={`px-2 py-1 rounded-full border flex-row items-center justify-center gap-1.5 mr-1 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-brand-green'
                          : 'bg-transparent dark:bg-transparent border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <View className="items-center justify-center mb-1">
                        <Icon
                          name={chip.icon}
                          size={14}
                          color={isSelected ? '#25B46E' : isDark ? '#94A3B8' : '#64748B'}
                        />
                      </View>
                      <Text
                        className={`text-2xs font-medium leading-none mr-1 mb-1 ${
                          isSelected
                            ? 'text-brand-green'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {showVerticalResults && (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
              >
                {filteredResults.length === 0 ? (
                  <View className="py-12 items-center justify-center">
                    <Icon name="solar:magnifer-bug-linear" size={40} color="#CBD5E1" />
                    <Text className="font-medium text-xs text-slate-400 mt-2 text-center">
                      {t('common.noResultsFound')}
                    </Text>
                  </View>
                ) : (
                  filteredResults.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleSelectItem(item.route)}
                      className={`flex-row items-center py-3.5 ${
                        index < filteredResults.length - 1
                          ? 'border-b border-slate-100 dark:border-slate-800'
                          : ''
                      }`}
                    >
                      <View className="w-10 h-10 rounded-full bg-brand-green/10 items-center justify-center mr-3">
                        <Icon name={item.icon} size={20} color="#25B46E" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline-bold text-sm text-slate-900 dark:text-white font-bold">
                          {item.title}
                        </Text>
                        <Text className="font-regular text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.subtitle}
                        </Text>
                      </View>
                      <Icon name="solar:alt-arrow-right-linear" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default HeaderBar;
