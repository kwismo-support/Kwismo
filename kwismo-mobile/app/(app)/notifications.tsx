import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';
import { useNotificationSettings } from '@/features/profile/hooks/useNotificationSettings';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { preferences, updatePreference } = useNotificationSettings();

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.notificationItem')}
        showBack={true}
        onBack={() => router.back()}
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-5 px-5">
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          className="gap-y-4"
        >
          <View className="flex-row items-start p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30">
            <Icon name="solar:bell-bing-bold" color="#3B82F6" size={24} className="mr-3" />
            <View className="flex-1">
              <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white mb-1">
                {t('notifications.infoTitle')}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300 leading-4.5">
                {preferences.push_enabled
                  ? t('notifications.pushEnabledInfo')
                  : t('notifications.inAppOnlyInfo')}
              </Text>
            </View>
          </View>

          <View className="bg-slate-50 dark:bg-brand-cardDark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 gap-y-4">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <View className="flex-1 pr-3">
                <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                  {t('notifications.pushTitle')}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('notifications.pushDesc')}
                </Text>
              </View>
              <CustomSwitch
                value={preferences.push_enabled}
                onValueChange={(val) => updatePreference('push_enabled', val)}
                activeColor="#FF9500"
              />
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <View className="flex-1 pr-3">
                <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                  {t('notifications.securityAlertsTitle')}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('notifications.securityAlertsDesc')}
                </Text>
              </View>
              <CustomSwitch
                value={preferences.alertes_securite}
                onValueChange={(val) => updatePreference('alertes_securite', val)}
                activeColor="#FF9500"
              />
            </View>

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <View className="flex-1 pr-3">
                <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                  {t('notifications.emailTitle')}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('notifications.emailDesc')}
                </Text>
              </View>
              <CustomSwitch
                value={preferences.email_enabled}
                onValueChange={(val) => updatePreference('email_enabled', val)}
                activeColor="#FF9500"
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white">
                  {t('notifications.smsTitle')}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('notifications.smsDesc')}
                </Text>
              </View>
              <CustomSwitch
                value={preferences.sms_enabled}
                onValueChange={(val) => updatePreference('sms_enabled', val)}
                activeColor="#FF9500"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
