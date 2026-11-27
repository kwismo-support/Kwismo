import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore';
import { PlanCard } from '@/features/subscriptions/components/PlanCard';
import type { SubscriptionPlanItem } from '@/features/subscriptions/types/subscription.types';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  const { availablePlans, currentPlan, loading, fetchPlans, fetchUserSubscription } = useSubscriptionStore();
  const [filter, setFilter] = useState<'all' | 'solo' | 'family'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchUserSubscription();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPlans(), fetchUserSubscription()]);
    setRefreshing(false);
  };

  const filteredPlans = availablePlans.filter((p) => {
    if (filter === 'solo') return p.max_membres <= 1;
    if (filter === 'family') return p.max_membres > 1;
    return true;
  });

  const handleSelectPlan = (plan: SubscriptionPlanItem) => {
    router.push({
      pathname: '/(app)/subscription-checkout',
      params: { planId: plan.id, planCode: plan.code },
    } as any);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-brand-darkBg">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <HeaderBar
        title={t('subscriptions.plansTitle')}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563EB" />
        }
      >
        {/* Hero Banner */}
        <View className="px-5 pt-3 pb-4">
          <View className="p-4 rounded-3xl bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-2xl bg-brand-blue items-center justify-center mr-3 shadow-sm">
                <Icon name="solar:shield-star-bold" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold font-title text-slate-900 dark:text-white">
                  {t('subscriptions.heroTitle')}
                </Text>
                <Text className="text-xs text-slate-600 dark:text-slate-300">
                  {t('subscriptions.heroSubtitle')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filtres par type d'offre */}
        <View className="flex-row px-5 mb-4 gap-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl border ${
              filter === 'all'
                ? 'bg-brand-navy dark:bg-white border-transparent'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === 'all' ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('subscriptions.filterAll')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('solo')}
            className={`px-4 py-2 rounded-xl border ${
              filter === 'solo'
                ? 'bg-brand-navy dark:bg-white border-transparent'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === 'solo' ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('subscriptions.filterSolo')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('family')}
            className={`px-4 py-2 rounded-xl border ${
              filter === 'family'
                ? 'bg-brand-navy dark:bg-white border-transparent'
                : 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === 'family' ? 'text-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('subscriptions.filterFamily')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste des cartes d'offres */}
        <View className="px-5">
          {loading && availablePlans.length === 0 ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-xs text-slate-400 mt-3 font-medium">
                {t('subscriptions.loadingPlans')}
              </Text>
            </View>
          ) : filteredPlans.length === 0 ? (
            <View className="py-12 items-center justify-center bg-white dark:bg-brand-cardDark rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <Icon name="solar:box-minimalistic-bold" size={36} color="#94A3B8" />
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                {t('subscriptions.noPlans')}
              </Text>
            </View>
          ) : (
            filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlan?.id === plan.id}
                onSelect={handleSelectPlan}
                isDark={isDark}
              />
            ))
          )}
        </View>

        {/* Note de réassurance */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-center gap-1.5 opacity-70">
            <Icon name="solar:lock-keyhole-minimalistic-bold" size={13} color="#64748B" />
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('subscriptions.reassuranceNotice')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
