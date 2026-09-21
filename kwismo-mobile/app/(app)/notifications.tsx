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
import { useNotifications, NotificationTabFilter } from '@/features/profile/hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    notifications,
    loading,
    refreshing,
    unreadCount,
    activeTab,
    setActiveTab,
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

  const handleSelectNotification = async (id: string, lu: boolean) => {
    if (!lu) {
      await markAsRead(id);
    }
    router.push({
      pathname: '/(app)/notification-detail',
      params: { id },
    });
  };

  return (
    <View className="flex-1 bg-brand-green">
      <StatusBar style="light" />

      {/* Header with Settings Gear icon as rightAction */}
      <HeaderBar
        title={t('common.notificationItem')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/notification-settings')}
            className="p-1"
          >
            <Icon name="solar:settings-bold" color="#FFFFFF" size={22} />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-4 px-5">
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
          {/* Tab Filters and Mark All Read Button */}
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* Filter Tabs */}
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-full border ${
                  activeTab === 'all'
                    ? 'bg-brand-green border-brand-green'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    activeTab === 'all'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('notifications.tabAll')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('unread')}
                className={`px-3.5 py-1.5 rounded-full border flex-row items-center space-x-1.5 ${
                  activeTab === 'unread'
                    ? 'bg-brand-orange border-brand-orange'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    activeTab === 'unread'
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('notifications.tabUnread')}
                </Text>
                {unreadCount > 0 && (
                  <View
                    className={`wx-4 hx-4 rounded-full items-center justify-center ${
                      activeTab === 'unread' ? 'bg-white' : 'bg-brand-orange'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        activeTab === 'unread' ? 'text-brand-orange' : 'text-white'
                      }`}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Tout marquer comme lu button - ONLY visible if unreadCount > 0 */}
            {unreadCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={markAllAsRead}
                className="flex-row items-center space-x-1 py-1.5 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-brand-orange/30"
              >
                <Icon name="solar:check-read-linear" size={16} color="#FF9500" />
                <Text className="text-xs font-bold text-brand-orange">
                  {t('notifications.markAll')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Activity Feed */}
          {loading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#00A859" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="bg-slate-50 dark:bg-brand-cardDark rounded-2xl p-8 items-center justify-center my-4 border border-slate-100 dark:border-slate-800">
              <View className="wx-14 hx-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 items-center justify-center mb-3">
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
            <View className="gap-y-3 pt-1">
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectNotification(item.id, item.lu)}
                  className={`p-4 rounded-2xl border transition-all ${
                    !item.lu
                      ? 'bg-amber-50/70 dark:bg-amber-950/25 border-brand-orange/35 shadow-sm'
                      : 'bg-slate-50 dark:bg-brand-cardDark border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <View className="flex-row items-start space-x-3">
                    <View
                      className={`wx-9 hx-9 rounded-full items-center justify-center ${
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
                      <View className="wx-2.5 hx-2.5 rounded-full bg-brand-orange mt-1" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
