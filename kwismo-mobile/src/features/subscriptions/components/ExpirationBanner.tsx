import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useSubscriptionStore } from '../store/subscriptionStore';

export function ExpirationBanner() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const { status, daysLeft, currentPlan } = useSubscriptionStore();

  if (status === 'active') {
    return null;
  }

  const handleAction = () => {
    router.push('/(app)/plans' as any);
  };

  const planName = currentPlan
    ? (isEn ? (currentPlan.nom_en || currentPlan.nom_fr) : currentPlan.nom_fr)
    : '';

  if (status === 'free') {
    return (
      <View className="mx-4 my-2.5 p-3.5 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="w-8 h-8 rounded-full bg-brand-blue/20 items-center justify-center mr-2.5">
            <Icon name="solar:shield-star-bold" size={18} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-slate-900 dark:text-white">
              {t('subscriptions.banner.freeTitle')}
            </Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('subscriptions.banner.freeSubtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-brand-blue px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {t('subscriptions.banner.viewPlans')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <View className="mx-4 my-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="w-8 h-8 rounded-full bg-amber-500/20 items-center justify-center mr-2.5">
            <Icon name="solar:clock-circle-bold" size={18} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-amber-800 dark:text-amber-400">
              {daysLeft === 0
                ? t('subscriptions.banner.expiresToday')
                : daysLeft === 1
                ? t('subscriptions.banner.expiresInDay')
                : t('subscriptions.banner.expiresInDays', { count: daysLeft })}
            </Text>
            <Text className="text-[11px] text-slate-600 dark:text-slate-300">
              {planName ? `${planName} — ` : ''}{t('subscriptions.banner.renewNotice')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-amber-600 px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {t('subscriptions.banner.renew')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'grace_period') {
    return (
      <View className="mx-4 my-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="w-8 h-8 rounded-full bg-rose-500/20 items-center justify-center mr-2.5">
            <Icon name="solar:danger-triangle-bold" size={18} color="#E11D48" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {t('subscriptions.banner.graceTitle')}
            </Text>
            <Text className="text-[11px] text-slate-600 dark:text-slate-300">
              {t('subscriptions.banner.graceSubtitle')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-rose-600 px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {t('subscriptions.banner.payNow')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // status === 'expired'
  return (
    <View className="mx-4 my-2.5 p-3.5 rounded-2xl bg-slate-900/10 dark:bg-rose-950/40 border border-rose-600/40 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 pr-3">
        <View className="w-8 h-8 rounded-full bg-rose-600/20 items-center justify-center mr-2.5">
          <Icon name="solar:shield-cross-bold" size={18} color="#E11D48" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-rose-700 dark:text-rose-400">
            {t('subscriptions.banner.suspendedTitle')}
          </Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('subscriptions.banner.suspendedSubtitle')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleAction}
        className="bg-brand-blue px-3 py-1.5 rounded-xl shadow-sm"
        activeOpacity={0.8}
      >
        <Text className="text-[11px] font-bold text-white">
          {t('subscriptions.banner.reactivate')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
