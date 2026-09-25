import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface GlobalPermissionGuardModalProps {
  visible: boolean;
  missingCount: number;
  onGrant: () => void;
  onDismiss: () => void;
}

export const GlobalPermissionGuardModal: React.FC<GlobalPermissionGuardModalProps> = ({
  visible,
  missingCount,
  onGrant,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-5">
        <View className="w-full max-w-sm rounded-3xl border border-amber-300/40 dark:border-amber-700/40 bg-white dark:bg-brand-cardDark p-6 items-center shadow-2xl elevation-12">
          <View className="wx-14 hx-14 rounded-full bg-amber-100 dark:bg-amber-950/60 justify-center items-center mb-3.5 border border-amber-300/50">
            <Icon name="solar:shield-warning-bold" size={32} color="#D97706" />
          </View>

          <Text className="text-lg font-montserrat-bold font-bold text-center text-slate-900 dark:text-white mb-1.5">
            {t('permissions.guardTitle')}
          </Text>

          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center leading-4.5 mb-4">
            {t('permissions.guardSub')}
          </Text>

          <View className="w-full gap-2 mb-4">
            <View className="flex-row items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <View className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center mr-3">
                <Icon name="solar:phone-calling-rounded-bold" size={18} color="#25B46E" />
              </View>
              <View className="flex-1">
                <Text className="font-montserrat-bold text-xs font-bold text-slate-900 dark:text-white">
                  {t('permissions.permCallLogTitle')}
                </Text>
                <Text className="text-2xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('permissions.permCallLogDesc')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 items-center justify-center mr-3">
                <Icon name="solar:users-group-two-rounded-bold" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="font-montserrat-bold text-xs font-bold text-slate-900 dark:text-white">
                  {t('permissions.permContactsTitle')}
                </Text>
                <Text className="text-2xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('permissions.permContactsDesc')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 items-center justify-center mr-3">
                <Icon name="solar:bell-bold" size={18} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="font-montserrat-bold text-xs font-bold text-slate-900 dark:text-white">
                  {t('permissions.permNotifTitle')}
                </Text>
                <Text className="text-2xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('permissions.permNotifDesc')}
                </Text>
              </View>
            </View>
          </View>

          <View className="w-full bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 mb-5 border border-amber-200 dark:border-amber-900/50">
            <Text className="text-2xs font-semibold text-amber-800 dark:text-amber-300 text-center leading-4">
              {t('permissions.warningNotice')}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onGrant}
            className="w-full hx-13 bg-brand-green rounded-xl justify-center items-center mb-2.5 shadow-md shadow-emerald-500/30"
          >
            <Text className="font-montserrat-bold text-sm font-bold text-white">
              {t('permissions.enableProtections')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDismiss}
            className="py-1.5"
          >
            <Text className="font-medium text-xs text-slate-400 dark:text-slate-500 underline">
              {t('permissions.continueRestricted')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
