import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { TabBar } from '../../src/shared/components/TabBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { useAuthStore } from '../../src/shared/store/authStore';
import { useDashboard } from '../../src/features/dashboard/hooks/useDashboard';
import { colors } from '../../src/styles/tokens';

type FilterCategory = 'all' | 'verified' | 'threats' | 'reports' | 'transfers';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { user } = useAuthStore();
  const { summary } = useDashboard();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email
    ? user.email.split('@')[0]
    : 'LOREM Ipsum';

  const rawActivities = summary?.recentActivities && summary.recentActivities.length > 0
    ? summary.recentActivities
    : [
        {
          id: 'act-1',
          phone: '+237 6 98 00 40 12',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Faible',
          badgeType: 'blue',
          date: "Aujourd'hui",
          initials: '',
        },
        {
          id: 'act-2',
          phone: 'Lysette Orleanne',
          type: 'Alerte menace',
          category: 'threats',
          status: 'Détecté',
          badgeType: 'red',
          date: 'hier, 07h30',
          initials: 'LO',
        },
        {
          id: 'act-3',
          phone: 'Superviseur NJS',
          type: '#150*1*695 12 34 36*1...',
          category: 'transfers',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a deux j...",
          initials: 'S',
          initialBg: '#F97316',
        },
        {
          id: 'act-4',
          phone: '+221 233 16 71 88',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a deux j...",
          initials: '',
        },
        {
          id: 'act-5',
          phone: '+237 6 40 43 01 00',
          type: 'Signalement',
          category: 'reports',
          status: 'En cours...',
          badgeType: 'yellow',
          date: "il y'a une s...",
          initials: '',
        },
        {
          id: 'act-6',
          phone: '+237 6 98 44 43 88',
          type: 'Verification de numero',
          category: 'verified',
          status: 'Protégé',
          badgeType: 'green',
          date: "il y'a un mois",
          initials: '',
        },
      ];

  const filteredActivities = rawActivities.filter((item: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return item.type.toLowerCase().includes('verif') || item.category === 'verified';
    if (activeFilter === 'threats') return item.type.toLowerCase().includes('menace') || item.category === 'threats';
    if (activeFilter === 'reports') return item.type.toLowerCase().includes('signal') || item.category === 'reports';
    if (activeFilter === 'transfers') return item.type.toLowerCase().includes('transfer') || item.category === 'transfers' || item.type.startsWith('#');
    return true;
  });

  const getBadgeStyle = (badgeType: string, statusText: string) => {
    if (statusText === 'Faible' || statusText.toLowerCase().includes('faible')) {
      return { bg: '#E8F0FE', text: '#1A73E8' };
    }
    if (statusText === 'Détecté' || statusText.toLowerCase().includes('détect') || badgeType === 'red') {
      return { bg: '#FCE8E6', text: '#D93025' };
    }
    if (statusText.toLowerCase().includes('cours') || badgeType === 'yellow') {
      return { bg: '#FEF7E0', text: '#B06000' };
    }
    return { bg: '#E6F4EA', text: '#1E8E3E' };
  };

  const filterOptions: { key: FilterCategory; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.filterAll' },
    { key: 'verified', labelKey: 'common.filterVerified' },
    { key: 'threats', labelKey: 'common.filterThreats' },
    { key: 'reports', labelKey: 'common.filterReports' },
    { key: 'transfers', labelKey: 'common.filterTransfers' },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      <StatusBar style="light" />

      <HeaderBar isHome={true} />

      <View className="px-4 -mt-[55px] z-10">
        <View
          className="rounded-[20px] p-4 mb-4 shadow-md shadow-black/10 elevation-4"
          style={{ backgroundColor: isDark ? themeColors.cardBg : '#FFFFFF' }}
        >
          <View className="flex-row items-center mb-4">
            <View className="mr-3">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-12 h-12 rounded-full" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-brand-green justify-center items-center">
                  <Text className="text-white text-xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text
                  className="text-[13px] leading-[18px] font-bold"
                  style={{ color: isDark ? themeColors.textSecondary : '#475569' }}
                >
                  {t('common.welcome')}
                </Text>
                <Icon name="solar:verified-check-bold" color={colors.green} size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text
                className="text-lg leading-6 font-bold mt-0.5"
                style={{ color: isDark ? themeColors.textPrimary : '#0F172A' }}
              >
                {userName}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-1">
            <View className="flex-1 items-start">
              <Text
                className="text-base leading-[22px] font-bold text-left"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {user?.kpi?.numeros_verifies ?? summary?.numeros_verifies ?? 127}
              </Text>
              <Text
                className="text-[10px] leading-[14px] font-medium text-left mt-0.5"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {t('common.kpiVerified')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text
                className="text-base leading-[22px] font-bold text-left"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                25
              </Text>
              <Text
                className="text-[10px] leading-[14px] font-medium text-left mt-0.5"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {t('common.kpiThreats')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text
                className="text-base leading-[22px] font-bold text-left"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {user?.kpi?.signalements_effectues ?? summary?.signalements_effectues ?? 10}
              </Text>
              <Text
                className="text-[10px] leading-[14px] font-medium text-left mt-0.5"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {t('common.kpiReports')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text
                className="text-base leading-[22px] font-bold text-left"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {user?.kpi?.transferts_proteges ?? summary?.transferts_proteges ?? 50}
              </Text>
              <Text
                className="text-[10px] leading-[14px] font-medium text-left mt-0.5"
                style={{ color: isDark ? themeColors.textPrimary : '#000000' }}
              >
                {t('common.kpiTransfers')}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            className="flex-1 items-center"
          >
            <View className="w-[52px] h-[52px] rounded-full justify-center items-center mb-1.5 bg-[#E8F0FE]">
              <Icon name="solar:shield-user-bold" color="#161E33" size={24} />
            </View>
            <Text
              className="text-[11px] leading-[14px] font-medium text-center"
              style={{ color: isDark ? themeColors.textPrimary : '#161E33' }}
            >
              {t('common.actionVerify')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            className="flex-1 items-center"
          >
            <View className="w-[52px] h-[52px] rounded-full justify-center items-center mb-1.5 bg-[#E8F0FE]">
              <Icon name="solar:transfer-horizontal-bold" color="#161E33" size={24} />
            </View>
            <Text
              className="text-[11px] leading-[14px] font-medium text-center"
              style={{ color: isDark ? themeColors.textPrimary : '#161E33' }}
            >
              {t('common.actionTransfer')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            className="flex-1 items-center"
          >
            <View className="w-[52px] h-[52px] rounded-full justify-center items-center mb-1.5 bg-[#E8F0FE]">
              <Icon name="solar:chat-round-dots-bold" color="#161E33" size={24} />
            </View>
            <Text
              className="text-[11px] leading-[14px] font-medium text-center"
              style={{ color: isDark ? themeColors.textPrimary : '#161E33' }}
            >
              {t('common.actionWhatsapp')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            className="flex-1 items-center"
          >
            <View className="w-[52px] h-[52px] rounded-full justify-center items-center mb-1.5 bg-[#FCE8E6]">
              <Icon name="heroicons:signal-16-solid" color="#D93025" size={24} />
            </View>
            <Text className="text-[11px] leading-[14px] font-medium text-center text-[#D93025]">
              {t('common.report')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-1.5 pt-1">
          <Text
            className="text-lg leading-6 font-bold"
            style={{ color: themeColors.textPrimary }}
          >
            {t('common.recentActivity')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowFilters(!showFilters)}
            className="p-1.5"
          >
            <Icon name="solar:tuning-3-linear" color="#161E33" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 0,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(opt.key)}
                  className="px-[14px] py-[6px] rounded-full border"
                  style={{
                    backgroundColor: isSelected
                      ? '#E6F4EA'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : '#FFFFFF',
                    borderColor: isSelected ? colors.green : '#E2E8F0',
                  }}
                >
                  <Text
                    className="text-[11px] leading-[15px] font-medium"
                    style={{
                      color: isSelected ? colors.green : isDark ? themeColors.textSecondary : '#64748B',
                    }}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View className="gap-1">
          {filteredActivities.map((item: any) => {
            const badgeStyle = getBadgeStyle(item.badgeType, item.status);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/(app)/verify', params: { phone: item.phone } })}
                className="flex-row items-center py-2 px-3 rounded-[14px] border-0"
                style={{ backgroundColor: themeColors.cardBg }}
              >
                <View
                  className="w-[38px] h-[38px] rounded-full bg-[#F1F5F9] justify-center items-center mr-[10px]"
                  style={item.initialBg ? { backgroundColor: item.initialBg } : item.initials ? { backgroundColor: colors.green } : {}}
                >
                  {item.initials ? (
                    <Text className="text-white font-bold text-[13px]">{item.initials}</Text>
                  ) : (
                    <Icon name="solar:user-bold" color="#94A3B8" size={20} />
                  )}
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text numberOfLines={1} className="text-[13px] leading-[18px] font-bold" style={{ color: themeColors.textPrimary }}>
                    {item.phone}
                  </Text>
                  <Text numberOfLines={1} className="text-[11px] leading-[15px] text-[#94A3B8] mt-0.5" style={{ color: themeColors.textSecondary }}>
                    {item.type}
                  </Text>
                </View>

                <View className="mx-1">
                  <View className="px-2 py-[3px] rounded-[10px]" style={{ backgroundColor: badgeStyle.bg }}>
                    <Text className="text-[10px] leading-[14px] font-semibold" style={{ color: badgeStyle.text }}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-end ml-1.5">
                  <Text numberOfLines={1} className="text-[10px] leading-[14px] text-[#94A3B8]">
                    {item.date}
                  </Text>
                  <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TabBar activeTab="home" />
    </View>
  );
}



