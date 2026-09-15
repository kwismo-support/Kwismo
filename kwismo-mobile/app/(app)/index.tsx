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
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { TabBar } from '@/shared/components/TabBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useAuthStore } from '@/shared/store/authStore';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { colors } from '@/styles/tokens';

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
      return { bgClass: 'bg-blue-50', textClass: 'text-blue-600' };
    }
    if (statusText === 'Détecté' || statusText.toLowerCase().includes('détect') || badgeType === 'red') {
      return { bgClass: 'bg-red-50', textClass: 'text-red-600' };
    }
    if (statusText.toLowerCase().includes('cours') || badgeType === 'yellow') {
      return { bgClass: 'bg-amber-50', textClass: 'text-amber-700' };
    }
    return { bgClass: 'bg-emerald-50', textClass: 'text-emerald-700' };
  };

  const filterOptions: { key: FilterCategory; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.filterAll' },
    { key: 'verified', labelKey: 'common.filterVerified' },
    { key: 'threats', labelKey: 'common.filterThreats' },
    { key: 'reports', labelKey: 'common.filterReports' },
    { key: 'transfers', labelKey: 'common.filterTransfers' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar isHome={true} />

      <View className="px-4 -mt-14 z-10">
        <View className="rounded-xl p-4 mb-4 shadow-md shadow-black/10 elevation-4 bg-white dark:bg-brand-cardDark">
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
                <Text className="text-2xs font-bold text-slate-600 dark:text-slate-400">
                  {t('common.welcome')}
                </Text>
                <Icon name="solar:verified-check-bold" color={colors.green} size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-lg font-bold mt-0.5 text-slate-900 dark:text-white">
                {userName}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-1">
            <View className="flex-1 items-start">
              <Text className="text-base font-bold text-left text-black dark:text-white">
                {user?.kpi?.numeros_verifies ?? summary?.numeros_verifies ?? 127}
              </Text>
              <Text className="text-2xs font-medium text-left mt-0.5 text-black dark:text-white">
                {t('common.kpiVerified')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text className="text-base font-bold text-left text-black dark:text-white">
                25
              </Text>
              <Text className="text-2xs font-medium text-left mt-0.5 text-black dark:text-white">
                {t('common.kpiThreats')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text className="text-base font-bold text-left text-black dark:text-white">
                {user?.kpi?.signalements_effectues ?? summary?.signalements_effectues ?? 10}
              </Text>
              <Text className="text-2xs font-medium text-left mt-0.5 text-black dark:text-white">
                {t('common.kpiReports')}
              </Text>
            </View>

            <View className="flex-1 items-start">
              <Text className="text-base font-bold text-left text-black dark:text-white">
                {user?.kpi?.transferts_proteges ?? summary?.transferts_proteges ?? 50}
              </Text>
              <Text className="text-2xs font-medium text-left mt-0.5 text-black dark:text-white">
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
            <View className="w-13 h-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="solar:shield-user-bold" color="#161E33" size={24} />
            </View>
            <Text className="text-2xs font-medium text-center text-brand-navy dark:text-white">
              {t('common.actionVerify')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            className="flex-1 items-center"
          >
            <View className="w-13 h-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="solar:transfer-horizontal-bold" color="#161E33" size={24} />
            </View>
            <Text className="text-2xs font-medium text-center text-brand-navy dark:text-white">
              {t('common.actionTransfer')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            className="flex-1 items-center"
          >
            <View className="w-13 h-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="solar:chat-round-dots-bold" color="#161E33" size={24} />
            </View>
            <Text className="text-2xs font-medium text-center text-brand-navy dark:text-white">
              {t('common.actionWhatsapp')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            className="flex-1 items-center"
          >
            <View className="w-13 h-13 rounded-full justify-center items-center mb-1.5 bg-red-50 dark:bg-red-950/40">
              <Icon name="heroicons:signal-16-solid" color="#D93025" size={24} />
            </View>
            <Text className="text-2xs font-medium text-center text-red-600 dark:text-red-400">
              {t('common.report')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-1.5 pt-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
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
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-brand-green'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-2xs font-medium ${
                      isSelected
                        ? 'text-brand-green'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
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
                className="flex-row items-center py-2 px-3 rounded-lg border-0 bg-white dark:bg-brand-cardDark"
              >
                <View
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 justify-center items-center mr-2.5"
                  style={item.initialBg ? { backgroundColor: item.initialBg } : item.initials ? { backgroundColor: colors.green } : {}}
                >
                  {item.initials ? (
                    <Text className="text-white font-bold text-2xs">{item.initials}</Text>
                  ) : (
                    <Icon name="solar:user-bold" color="#94A3B8" size={20} />
                  )}
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text numberOfLines={1} className="text-2xs font-bold text-slate-900 dark:text-white">
                    {item.phone}
                  </Text>
                  <Text numberOfLines={1} className="text-2xs text-slate-400 dark:text-slate-400 mt-0.5">
                    {item.type}
                  </Text>
                </View>

                <View className="mx-1">
                  <View className={`px-2 py-0.5 rounded-md ${badgeStyle.bgClass}`}>
                    <Text className={`text-2xs font-semibold ${badgeStyle.textClass}`}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-end ml-1.5">
                  <Text numberOfLines={1} className="text-2xs text-slate-400">
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




