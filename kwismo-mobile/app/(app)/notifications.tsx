import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { toast } from '@/shared/store/toastStore';
import { colors } from '@/styles/tokens';
import { MOCK_NOTIFICATIONS, NotificationItem } from '@/shared/mock/notificationsMock';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'security'>('all');
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.read);
    if (activeTab === 'security') return notifications.filter((n) => n.type === 'security');
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t('notifications.markedAllRead'));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'security':
        return { name: 'solar:danger-triangle-bold', color: '#EF4444', bgClass: 'bg-red-100 dark:bg-red-950/50' };
      case 'transfer':
        return { name: 'solar:card-send-bold', color: colors.green, bgClass: 'bg-emerald-100 dark:bg-emerald-950/50' };
      case 'sim':
        return { name: 'solar:sim-cards-bold', color: colors.orange, bgClass: 'bg-amber-100 dark:bg-amber-950/50' };
      default:
        return { name: 'solar:bell-bold', color: '#3B82F6', bgClass: 'bg-blue-100 dark:bg-blue-950/50' };
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar title={t('common.notifications')} showBack={true} />

      <View className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-2.5">
        <View className="flex-row items-center gap-2">
          {[
            { id: 'all', label: t('notifications.tabAll') },
            { id: 'unread', label: `${t('notifications.tabUnread')} (${unreadCount})` },
            { id: 'security', label: t('notifications.tabSecurity') },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-full ${
                  isSelected
                    ? 'bg-brand-green'
                    : 'bg-slate-100 dark:bg-white/5'
                }`}
              >
                <Text
                  className={`font-semibold text-2xs ${
                    isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between">
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} className="flex-row items-center gap-1.5">
              <Icon name="solar:check-read-linear" size={18} color={colors.green} />
              <Text className="font-medium text-2xs text-brand-green">
                {t('notifications.markAll', 'Tout lire')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setPreferencesModalVisible(true)}
            className="w-9 h-9 rounded-full items-center justify-center bg-slate-100 dark:bg-white/10"
          >
            <Icon name="solar:settings-bold" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View className="py-16 items-center justify-center">
            <Icon name="solar:bell-off-linear" size={48} color="#CBD5E1" />
            <Text className="font-extrabold text-base mt-3 text-slate-900 dark:text-white">
              {t('notifications.emptyTitle', 'Aucune notification')}
            </Text>
            <Text className="font-normal text-xs mt-1 text-center text-slate-500 dark:text-slate-400">
              {t('notifications.emptySub', 'Vous êtes à jour ! Aucune alerte en attente.')}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const iconMeta = getIconForType(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => {
                  handleToggleRead(item.id);
                  if (item.actionUrl) router.push(item.actionUrl as any);
                }}
                className={`flex-row items-start p-3.5 rounded-2xl border relative ${
                  item.read
                    ? 'bg-white dark:bg-brand-cardDark border-slate-200 dark:border-slate-700/60'
                    : 'bg-emerald-50/60 dark:bg-slate-800 border-brand-green'
                }`}
              >
                {!item.read && <View className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-brand-green" />}

                <View className={`w-11 h-11 rounded-full items-center justify-center ${iconMeta.bgClass}`}>
                  <Icon name={iconMeta.name} size={22} color={iconMeta.color} />
                </View>

                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between pr-4">
                    <Text className="font-bold text-sm flex-1 text-slate-900 dark:text-white">
                      {item.title}
                    </Text>
                    <Text className="font-normal text-2xs text-slate-400">
                      {item.timestamp}
                    </Text>
                  </View>
                  <Text className="font-normal text-xs mt-1 text-slate-600 dark:text-slate-400 leading-4">
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={preferencesModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="rounded-t-3xl p-6 gap-4 bg-white dark:bg-brand-cardDark">
            <View className="flex-row items-center justify-between">
              <Text className="font-extrabold text-base text-slate-900 dark:text-white">
                {t('notifications.preferencesTitle', 'Canaux de notification')}
              </Text>
              <TouchableOpacity onPress={() => setPreferencesModalVisible(false)}>
                <Icon name="solar:close-circle-bold" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                Notifications Push
              </Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                Alertes de sécurité SMS
              </Text>
              <Switch
                value={smsAlertsEnabled}
                onValueChange={setSmsAlertsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="font-medium text-sm text-slate-900 dark:text-white">
                Alertes WhatsApp
              </Text>
              <Switch
                value={whatsappAlertsEnabled}
                onValueChange={setWhatsappAlertsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setPreferencesModalVisible(false);
                toast.success('Préférences de notification mises à jour !');
              }}
              className="h-12 rounded-xl items-center justify-center bg-brand-green mt-4"
            >
              <Text className="font-bold text-sm text-white">{t('common.save', 'Enregistrer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

