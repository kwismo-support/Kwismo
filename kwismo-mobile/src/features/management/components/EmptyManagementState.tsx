import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';

interface EmptyManagementStateProps {
  onAddNumber: () => void;
}

export function EmptyManagementState({ onAddNumber }: EmptyManagementStateProps) {
  const { t } = useTranslation();

  return (
    <View className="py-10 px-4 items-center justify-center bg-white dark:bg-brand-cardDark rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <View className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 items-center justify-center mb-3">
        <Icon name="solar:phone-calling-bold" color="#F97316" size={32} />
      </View>
      <Text className="font-title text-base font-bold text-slate-900 dark:text-white text-center mb-1">
        {t('common.noRegisteredNumbersTitle')}
      </Text>
      <Text className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-[280px] leading-5 mb-5">
        {t('common.noRegisteredNumbersSubtitle')}
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAddNumber}
        className="px-5 py-2.5 rounded-xl bg-orange-500 flex-row items-center gap-2"
      >
        <Icon name="solar:add-linear" color="#FFFFFF" size={18} />
        <Text className="font-bold text-xs text-white">
          {t('common.addNumber')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
