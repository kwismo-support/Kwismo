import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useSubscriptionStore } from '../store/subscriptionStore';

export function ExpirationBanner() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const { status, daysLeft, currentPlan } = useSubscriptionStore();

  if (status === 'active') {
    return null; // Tout va bien, pas besoin d'alerte intrusive
  }

  const handleAction = () => {
    router.push('/(app)/plans' as any);
  };

  if (status === 'free') {
    return (
      <View className="mx-4 my-2.5 p-3.5 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="w-8 h-8 rounded-full bg-brand-blue/20 items-center justify-center mr-2.5">
            <Icon name="solar:shield-star-bold" size={18} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-slate-900 dark:text-white">
              {isEn ? 'Activate Full Protection' : 'Passez au Bouclier Premium'}
            </Text>
            <Text className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Protect up to 10 numbers & your whole family' : 'Protégez jusqu’à 10 numéros et vos proches'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-brand-blue px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {isEn ? 'View Plans' : 'Voir les offres'}
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
                ? (isEn ? 'Expires Today!' : 'Expire aujourd’hui !')
                : (isEn ? `Expires in ${daysLeft} days` : `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`)}
            </Text>
            <Text className="text-[11px] text-slate-600 dark:text-slate-300">
              {currentPlan ? (isEn ? currentPlan.nom_en : currentPlan.nom_fr) : ''} — {isEn ? 'Renew to avoid interruption' : 'Prolongez pour rester protégé'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-amber-600 px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {isEn ? 'Renew' : 'Prolonger'}
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
              {isEn ? 'Grace Period (72h)' : 'Période de Grâce (72h)'}
            </Text>
            <Text className="text-[11px] text-slate-600 dark:text-slate-300">
              {isEn ? 'Subscription ended. Renew now to keep alerts active.' : 'Échéance dépassée. Régularisez pour garder vos alertes.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAction}
          className="bg-rose-600 px-3 py-1.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-[11px] font-bold text-white">
            {isEn ? 'Pay Now' : 'Régulariser'}
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
            {isEn ? 'Protection Suspended' : 'Protection Suspendue'}
          </Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400">
            {isEn ? 'Your numbers are no longer actively filtered.' : 'Vos numéros ne sont plus protégés contre les fraudes.'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleAction}
        className="bg-brand-blue px-3 py-1.5 rounded-xl shadow-sm"
        activeOpacity={0.8}
      >
        <Text className="text-[11px] font-bold text-white">
          {isEn ? 'Reactivate' : 'Réactiver'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
