import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { TabBar } from '@/shared/components/TabBar';
import { Skeleton, SkeletonLoader } from '@/shared/ui/Skeleton';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useAuthStore } from '@/shared/store/authStore';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { colors } from '@/styles/tokens';

type FilterCategory = 'all' | 'verified' | 'threats' | 'reports' | 'transfers';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const { user } = useAuthStore();
  const { summary, loading, refreshing, refresh } = useDashboard();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const userName = useMemo(() => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  }, [user]);

  const activities = useMemo(() => {
    return summary?.recentActivities || [];
  }, [summary]);

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      if (activeFilter === 'all') return true;
      return item.category === activeFilter;
    });
  }, [activities, activeFilter]);

  const getBadgeStyle = (badgeType: string) => {
    if (badgeType === 'blue') {
      return { bgClass: 'bg-blue-50 dark:bg-blue-950/100', textClass: 'text-blue-600 dark:text-blue-400' };
    }
    if (badgeType === 'red') {
      return { bgClass: 'bg-red-50 dark:bg-red-950/100', textClass: 'text-red-500 dark:text-red-400' };
    }
    if (badgeType === 'yellow') {
      return { bgClass: 'bg-amber-50 dark:bg-amber-950/100', textClass: 'text-amber-600 dark:text-amber-400' };
    }
    return { bgClass: 'bg-emerald-50 dark:bg-emerald-950/100', textClass: 'text-brand-green' };
  };

  const filterOptions: { key: FilterCategory; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.filterAll' },
    { key: 'verified', labelKey: 'common.filterVerified' },
    { key: 'threats', labelKey: 'common.filterThreats' },
    { key: 'reports', labelKey: 'common.filterReports' },
    { key: 'transfers', labelKey: 'common.filterTransfers' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg relative">
      <StatusBar style="light" />

      <HeaderBar isHome={true} />

      <View className="px-4 -mt-14 z-10">
        {loading ? (
          <SkeletonLoader>
            <View className="rounded-xl p-4 mb-4 shadow-xl elevation-4 bg-white dark:bg-brand-cardDark">
              <View className="flex-row items-center mb-4">
                <Skeleton width={52} height={52} borderRadius={26} style={{ marginRight: 12 }} />
                <View className="flex-1 gap-1">
                  <Skeleton width={80} height={14} borderRadius={4} />
                  <Skeleton width={140} height={20} borderRadius={6} />
                </View>
              </View>
              <View className="flex-row justify-around pt-1 p-2 gap-4">
                <View className="flex-1 items-start gap-1">
                  <Skeleton width={40} height={22} borderRadius={4} />
                  <Skeleton width={60} height={10} borderRadius={3} />
                </View>
                <View className="flex-1 items-start gap-1">
                  <Skeleton width={40} height={22} borderRadius={4} />
                  <Skeleton width={60} height={10} borderRadius={3} />
                </View>
                <View className="flex-1 items-start gap-1">
                  <Skeleton width={40} height={22} borderRadius={4} />
                  <Skeleton width={60} height={10} borderRadius={3} />
                </View>
                <View className="flex-1 items-start gap-1">
                  <Skeleton width={40} height={22} borderRadius={4} />
                  <Skeleton width={60} height={10} borderRadius={3} />
                </View>
              </View>
            </View>
          </SkeletonLoader>
        ) : (
          <View className="rounded-xl p-4 mb-4 shadow-xl shadow-black elevation-4 bg-white dark:bg-brand-cardDark">
            <View className="flex-row items-center mb-4">
              <View className="mr-3">
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="wx-13 hx-13 rounded-full"
                  />
                ) : (
                  <View className="wx-13 hx-13 rounded-full bg-emerald-100 dark:bg-emerald-900/40 justify-center items-center border border-brand-green/30">
                    <Text className="font-headline-bold text-xl font-extrabold text-brand-green dark:text-emerald-400">
                      {(userName || 'K').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xs font-medium text-slate-700 dark:text-slate-300 mr-1.5">
                    {t('common.welcome')}
                  </Text>
                  <Icon name="reicon:verify-filled" color={colors.green} size={15} />
                </View>

                <Text className="text-xl font-bold font-title text-slate-900 dark:text-white mt-0.5">
                  {userName}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-around pt-1 p-2 gap-4">
              <View className="flex-1 items-start">
                <Text className="text-xl font-medium text-left text-black dark:text-white">
                  {summary?.numeros_verifies ?? user?.kpi?.numeros_verifies ?? 0}
                </Text>
                <Text className="text-3xs font-medium text-left mt-0.5 text-black dark:text-white">
                  {t('common.kpiVerified')}
                </Text>
              </View>

              <View className="flex-1 items-start">
                <Text className="text-xl font-medium text-left text-black dark:text-white">
                  {summary?.threats_avoided ?? 0}
                </Text>
                <Text className="text-3xs font-medium text-left mt-0.5 text-black dark:text-white">
                  {t('common.kpiThreats')}
                </Text>
              </View>

              <View className="flex-1 items-start">
                <Text className="text-xl font-medium text-left text-black dark:text-white">
                  {summary?.signalements_effectues ?? user?.kpi?.signalements_effectues ?? 0}
                </Text>
                <Text className="text-3xs font-medium text-left mt-0.5 text-black dark:text-white">
                  {t('common.kpiReports')}
                </Text>
              </View>

              <View className="flex-1 items-start">
                <Text className="text-xl font-medium text-left text-black dark:text-white">
                  {summary?.transferts_proteges ?? user?.kpi?.transferts_proteges ?? 0}
                </Text>
                <Text className="text-3xs font-medium text-left mt-0.5 text-black dark:text-white">
                  {t('common.kpiTransfers')}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            className="flex-1 items-center"
          >
            <View className="wx-13 hx-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="mage:scan-user-fill" color={isDark ? 'white' : '#161E33'} size={24} />
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
            <View className="wx-13 hx-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="solar:square-transfer-horizontal-linear" color={isDark ? 'white' : '#161E33'} size={24} />
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
            <View className="wx-13 hx-13 rounded-full justify-center items-center mb-1.5 bg-blue-50 dark:bg-slate-800">
              <Icon name="basil:whatsapp-outline" color={isDark ? 'white' : '#161E33'} size={24} />
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
            <View className="wx-13 hx-13 rounded-full justify-center items-center mb-1.5 bg-red-50 dark:bg-red-950/40">
              <Icon name="heroicons:signal-16-solid" color="#D93025" size={24} />
            </View>
            <Text className="text-2xs font-medium text-center text-red-600 dark:text-red-400">
              {t('common.report')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-1.5 pt-1">
          <Text className="text-sm font-bold text-slate-900 dark:text-white">
            {t('common.recentActivity')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleFilters}
            className="p-1.5"
          >
            <Icon name="hugeicons:filter" color={isDark ? 'white' : '#161E33'} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 overflow-hidden">
        {showFilters && (
          <Animated.View
            entering={FadeInUp.duration(280)}
            exiting={FadeOutUp.duration(200)}
          >
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
                    className={`px-3 py-1.5 rounded-full border ${isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-brand-green'
                      : 'bg-transparent dark:bg-transparent border-slate-300 dark:border-slate-700'
                      }`}
                  >
                    <Text
                      className={`text-2xs font-medium ${isSelected
                        ? 'text-brand-green'
                        : 'text-slate-400 dark:text-slate-400'
                        }`}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 0,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
      >
        {loading ? (
          <SkeletonLoader>
            <View className="gap-3 py-2">
              {[1, 2, 3, 4].map((key) => (
                <View key={key} className="flex-row items-center py-2">
                  <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 10 }} />
                  <View className="flex-1 gap-1">
                    <Skeleton width={130} height={14} borderRadius={4} />
                    <Skeleton width={90} height={10} borderRadius={3} />
                  </View>
                  <Skeleton width={60} height={20} borderRadius={10} />
                </View>
              ))}
            </View>
          </SkeletonLoader>
        ) : filteredActivities.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Icon name="solar:clock-circle-linear" color="#94A3B8" size={36} />
            <Text className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 text-center">
              {activeFilter === 'all'
                ? t('common.noRecentActivity')
                : t('common.noActivityForFilter')}
            </Text>
          </View>
        ) : (
          <View className="gap-1">
            {filteredActivities.map((item) => {
              const badgeStyle = getBadgeStyle(item.badgeType);
              const displayType = item.type.includes('.') ? t(item.type) : item.type;
              const displayStatus = item.status.includes('.') ? t(item.status) : item.status;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  onPress={() => router.push({ pathname: '/(app)/verify', params: { phone: item.phone } })}
                  className="flex-row items-center py-2.5"
                >
                  <View
                    className="wx-10 hx-10 rounded-full bg-slate-100 dark:bg-slate-800 justify-center items-center mr-2.5"
                    style={item.initialBg ? { backgroundColor: item.initialBg } : item.initials ? { backgroundColor: colors.green } : {}}
                  >
                    {item.initials ? (
                      <Text className="text-white font-bold text-2xs">{item.initials}</Text>
                    ) : (
                      <Icon name="solar:user-bold" color="#94A3B8" size={20} />
                    )}
                  </View>

                  <View className="flex-1 pr-1">
                    <Text numberOfLines={1} className="text-2xs font-bold text-slate-900 dark:text-white">
                      {item.phone}
                    </Text>
                    <Text numberOfLines={1} className="text-2xs text-slate-400 dark:text-slate-400 mt-0.5">
                      {displayType}
                    </Text>
                  </View>

                  <View className="w-24 items-center justify-center">
                    <View className={`px-2.5 py-0.5 rounded-full ${badgeStyle.bgClass}`}>
                      <Text className={`text-2xs font-semibold ${badgeStyle.textClass}`}>
                        {displayStatus}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-end w-24">
                    <Text numberOfLines={1} className="text-2xs text-slate-400 dark:text-slate-500">
                      {item.date}
                    </Text>
                    <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={14} style={{ marginLeft: 3 }} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/(app)/report')}
        className="absolute bottom-20 right-5 z-50 wx-13 hx-13 rounded-full bg-brand-orange justify-center items-center shadow-lg shadow-brand-orange/40 elevation-6"
      >
        <Icon name="famicons:person-add" color="#FFFFFF" size={24} />
      </TouchableOpacity>

      <TabBar activeTab="home" />
    </View>
  );
}
