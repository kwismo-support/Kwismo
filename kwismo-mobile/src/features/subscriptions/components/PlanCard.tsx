import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import type { SubscriptionPlanItem } from '../types/subscription.types';

interface PlanCardProps {
  plan: SubscriptionPlanItem;
  isCurrent?: boolean;
  onSelect: (plan: SubscriptionPlanItem) => void;
  isDark?: boolean;
}

export function PlanCard({ plan, isCurrent = false, onSelect, isDark = false }: PlanCardProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const title = isEn ? plan.nom_en : plan.nom_fr;
  const description = isEn ? (plan.description_en || plan.description_fr) : plan.description_fr;
  const badgeText = isEn ? (plan.badge_en || plan.badge_fr) : (plan.badge_fr || plan.badge_en);
  const options = (isEn ? (plan.options_en || plan.options_fr) : plan.options_fr) || [];

  const isPopular = badgeText?.toLowerCase().includes('popul') || badgeText?.toLowerCase().includes('recommand');

  return (
    <View
      className={`rounded-2xl p-5 mb-4 border transition-all ${
        isCurrent
          ? 'bg-emerald-500/10 border-emerald-500 shadow-sm'
          : isPopular
          ? 'bg-brand-blue/5 border-brand-blue dark:bg-brand-blue/10'
          : isDark
          ? 'bg-[#1D273F] border-white/10'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header avec Titre et Badge */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <Text className={`text-lg font-bold font-title ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </Text>
          {description ? (
            <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {description}
            </Text>
          ) : null}
        </View>

        {badgeText ? (
          <View className="bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Prix et Durée */}
      <View className="flex-row items-baseline my-3">
        <Text className={`text-2xl font-extrabold font-title ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {plan.prix_fcfa.toLocaleString('fr-FR')} FCFA
        </Text>
        <Text className={`text-xs ml-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          / {plan.duree_jours} {isEn ? 'days' : 'jours'}
        </Text>
      </View>

      {/* Capacités clés (Numéros & Membres) */}
      <View className="flex-row items-center gap-2 mb-4">
        <View className={`flex-row items-center px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <Icon name="solar:phone-bold" size={13} color="#10B981" />
          <Text className={`text-[11px] font-semibold ml-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {plan.max_numeros} {plan.max_numeros > 1 ? (isEn ? 'numbers' : 'numéros') : (isEn ? 'number' : 'numéro')}
          </Text>
        </View>

        <View className={`flex-row items-center px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <Icon name="solar:users-group-two-rounded-bold" size={13} color="#6366F1" />
          <Text className={`text-[11px] font-semibold ml-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {plan.max_membres} {plan.max_membres > 1 ? (isEn ? 'members' : 'personnes') : (isEn ? 'member' : 'personne')}
          </Text>
        </View>
      </View>

      {/* Liste des fonctionnalités */}
      {options.length > 0 && (
        <View className="border-t border-slate-100 dark:border-white/10 pt-3 mb-4">
          {options.map((opt, idx) => (
            <View key={idx} className="flex-row items-center mb-1.5">
              <Icon name="solar:check-circle-bold" size={14} color="#10B981" />
              <Text className={`text-xs ml-2 flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {opt}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Bouton d'action */}
      {isCurrent ? (
        <View className="w-full py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center flex-row">
          <Icon name="solar:verified-check-bold" size={16} color="#10B981" />
          <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
            {isEn ? 'Current Plan Active' : 'Formule Actuellement Active'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => onSelect(plan)}
          activeOpacity={0.8}
          className={`w-full py-3 rounded-xl items-center justify-center shadow-sm ${
            isPopular ? 'bg-brand-blue' : 'bg-brand-navy dark:bg-white'
          }`}
        >
          <Text
            className={`text-xs font-bold tracking-wide ${
              isPopular ? 'text-white' : 'text-white dark:text-slate-900'
            }`}
          >
            {isEn ? 'Choose This Plan' : 'Choisir cette formule'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
