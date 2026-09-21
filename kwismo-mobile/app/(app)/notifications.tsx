import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CustomSwitch } from '@/shared/ui/CustomSwitch';
import { useNotificationSettings } from '@/features/profile/hooks/useNotificationSettings';
import { useNotifications } from '@/features/profile/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { preferences, updatePreference } = useNotificationSettings();
  const {
    notifications,
    loading,
    refreshing,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor="#00A859"
              colors={['#00A859']}
            />
          }
          className="gap-y-4"
        >
          {/* Unread banner and Mark all read button */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center space-x-2">
              <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white">
                {t('notifications.tabAll')}
              </Text>
              {unreadCount > 0 && (
                <View className="bg-brand-orange px-2.5 py-0.5 rounded-full">
                  <Text className="text-white text-xs font-semibold font-caption">
                    {unreadCount} {t('notifications.tabUnread').toLowerCase()}
                  </Text>
                </View>
              )}
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={markAllAsRead}
                className="flex-row items-center space-x-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <Icon name="solar:check-read-linear" size={16} color="#FF9500" />
                <Text className="text-xs font-semibold text-brand-orange">
                  {t('notifications.markAll')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Activity Feed */}
          {loading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#00A859" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="bg-slate-50 dark:bg-brand-cardDark rounded-2xl p-8 items-center justify-center text-center my-2 border border-slate-100 dark:border-slate-800">
              <View className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 items-center justify-center mb-3">
                <Icon name="solar:bell-bing-bold" color="#00A859" size={28} />
              </View>
              <Text className="font-montserrat-bold text-base font-bold text-slate-900 dark:text-white text-center mb-1">
                {t('notifications.emptyTitle')}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 text-center leading-4.5 max-w-[240px]">
                {t('notifications.emptySub')}
              </Text>
            </View>
          ) : (
            <View className="gap-y-3">
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => markAsRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all ${
                    !item.lu
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-brand-orange/30'
                      : 'bg-slate-50 dark:bg-brand-cardDark border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <View className="flex-row items-start space-x-3">
                    <View
                      className={`w-9 h-9 rounded-full items-center justify-center ${
                        !item.lu
                          ? 'bg-brand-orange/20'
                          : 'bg-slate-200/70 dark:bg-slate-800'
                      }`}
                    >
                      <Icon
                        name={!item.lu ? 'solar:bell-bing-bold' : 'solar:bell-linear'}
                        color={!item.lu ? '#FF9500' : '#64748B'}
                        size={20}
                      />
                    </View>

                    <View className="flex-1 pr-1">
                      <Text
                        className={`text-xs leading-4.5 mb-1 ${
                          !item.lu
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.texte}
                      </Text>
                      <Text className="text-[11px] font-caption text-slate-400 dark:text-slate-500">
                        {formatDate(item.date)}
                      </Text>
                    </View>

                    {!item.lu && (
                      <View className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Info Banner */}
          <View className="flex-row items-start p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 mt-2">
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

          {/* Notification Preferences Settings */}
          <View className="bg-slate-50 dark:bg-brand-cardDark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 gap-y-4">
            <Text className="font-montserrat-bold text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-2">
              {t('notifications.preferencesTitle')}
            </Text>

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
