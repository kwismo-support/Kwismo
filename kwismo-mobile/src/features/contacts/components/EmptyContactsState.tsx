import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';

interface EmptyContactsStateProps {
  permissionGranted: boolean | null;
  onRequestPermission: () => void;
  onAddContact: () => void;
}

export function EmptyContactsState({
  permissionGranted,
  onRequestPermission,
  onAddContact,
}: EmptyContactsStateProps) {
  const { t } = useTranslation();

  if (permissionGranted === false) {
    return (
      <View className="py-12 px-6 items-center justify-center">
        <Icon name="solar:users-group-two-rounded-bold" color="#94A3B8" size={64} className="mb-4" />
        <Text className="font-title text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
          {t('common.contactsPermissionTitle')}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-5">
          {t('common.contactsPermissionSubtitle')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRequestPermission}
          className="px-6 py-3 rounded-xl bg-brand-green"
        >
          <Text className="font-bold text-sm text-white">
            {t('common.grantPermission')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="py-12 px-6 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mb-3">
        <Icon name="solar:users-group-rounded-linear" color="#94A3B8" size={32} />
      </View>
      <Text className="font-title text-base font-bold text-slate-900 dark:text-white text-center mb-1">
        {t('common.noContactsFound')}
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAddContact}
        className="mt-4 px-5 py-2.5 rounded-xl bg-brand-green flex-row items-center gap-2"
      >
        <Icon name="solar:add-linear" color="#FFFFFF" size={18} />
        <Text className="font-bold text-xs text-white">
          {t('common.addNumber')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
