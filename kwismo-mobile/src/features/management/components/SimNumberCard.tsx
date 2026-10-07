import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { CountryFlag } from '@/shared/components/CountryFlag';
import { UserSimNumber } from '../types/management.types';

interface SimNumberCardProps {
  item: UserSimNumber;
  onOpenOtp: (item: UserSimNumber) => void;
  onDeclareCompromised: (item: UserSimNumber) => void;
  onMarkAsSecured?: (item: UserSimNumber) => void;
  onOpenDelete: (item: UserSimNumber) => void;
}

export function SimNumberCard({
  item,
  onOpenOtp,
  onDeclareCompromised,
  onMarkAsSecured,
  onOpenDelete,
}: SimNumberCardProps) {
  const { t } = useTranslation();

  const isVerified = item.status === 'verified';
  const isPending = item.status === 'pending';
  const isCompromised = item.status === 'compromised';

  return (
    <View
      className={`w-full rounded-2xl border bg-white dark:bg-brand-cardDark p-4 shadow-sm mt-2 ${
        isCompromised
          ? 'border-red-500'
          : 'border-slate-100 dark:border-slate-800'
      }`}
    >
      <View className="flex-row items-center justify-between mb-0.5">
        <View className="flex-row items-center">
          <CountryFlag countryCode={item.countryCode} size={24} className="mr-2.5 overflow-hidden" />
          <View>
            <Text className="font-title text-base font-bold text-slate-900 dark:text-white">
              {item.phone}
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {item.operator}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onOpenDelete(item)}
          className="wx-8 hx-8 rounded-full bg-red-50 dark:bg-red-950/40 items-center justify-center"
        >
          <Icon name="gravity-ui:trash-bin" color="#FF3B30" size={16} />
        </TouchableOpacity>
      </View>

      <View className="my-1 mt-2 mb-2 border-t border-slate-100 dark:border-slate-800" />

      <View className="flex-row items-center justify-between">
        {isPending && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenOtp(item)}
            className="px-4 py-1.5 rounded-lg bg-orange-500 flex-row items-center gap-1.5"
          >
            <Icon name="solar:shield-warning-bold" color="#FFFFFF" size={14} />
            <Text className="font-bold text-xs text-white">
              {t('common.validate')}
            </Text>
          </TouchableOpacity>
        )}

        {isCompromised && (
          <View className="flex-row items-center gap-2">
            <View className="px-2.5 py-1 rounded bg-red-100 dark:bg-red-900/40 flex-row items-center gap-1">
              <Icon name="solar:danger-bold" color="#EF4444" size={14} />
              <Text className="font-bold text-xs text-red-600 dark:text-red-400">
                {t('common.statusCompromised')}
              </Text>
            </View>

            {onMarkAsSecured && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onMarkAsSecured(item)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 flex-row items-center gap-1"
              >
                <Icon name="solar:shield-check-bold" color="#FFFFFF" size={14} />
                <Text className="font-bold text-xs text-white">
                  {t('common.markAsSecured')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isVerified && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onDeclareCompromised(item)}
            className="px-3.5 py-2 rounded-xl bg-brand-green flex-row items-center justify-center self-start"
          >
            <Icon name="solar:shield-check-bold" color="#FFFFFF" size={15} style={{ marginRight: 6 }} />
            <Text className="font-bold text-xs text-white">
              {t('common.declareAsCompromised')}
            </Text>
          </TouchableOpacity>
        )}

        {item.addedDate ? (
          <Text className="text-xs text-slate-400 dark:text-slate-500 font-regular">
            {item.addedDate}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
