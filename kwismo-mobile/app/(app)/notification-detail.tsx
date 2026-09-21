import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { notificationsApi, NotificationBackendItem } from '@/features/profile/services/notifications.api';
import { toast } from '@/shared/store/toastStore';

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [notification, setNotification] = useState<NotificationBackendItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await notificationsApi.getNotificationById(params.id!);
        if (res.success && res.data) {
          setNotification(res.data);
          // Mark as read automatically when opened
          if (!res.data.lu) {
            await notificationsApi.markAsRead(params.id!);
          }
        }
      } catch (err) {
        console.error('Failed to load notification detail:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleDelete = async () => {
    if (!params.id) return;
    setDeleting(true);
    try {
      const res = await notificationsApi.deleteNotification(params.id);
      if (res.success) {
        toast.success('Notification supprimée.');
        router.back();
      } else {
        toast.error('Erreur lors de la suppression.');
      }
    } catch {
      toast.error('Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
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
        title="Détail de la notification"
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDelete}
            disabled={deleting || !notification}
            className="p-1"
          >
            {deleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon name="solar:trash-bin-trash-bold" color="#FFFFFF" size={22} />
            )}
          </TouchableOpacity>
        }
      />

      <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] overflow-hidden pt-6 px-5">
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#00A859" />
          </View>
        ) : !notification ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Notification introuvable.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
            className="gap-y-6"
          >
            <View className="flex-row items-center space-x-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <View className="wx-12 hx-12 rounded-2xl bg-brand-orange/15 items-center justify-center">
                <Icon name="solar:bell-bing-bold" color="#FF9500" size={26} />
              </View>

              <View className="flex-1">
                <Text className="font-caption text-xs font-semibold text-brand-orange uppercase tracking-wider mb-1">
                  Alerte Kwismo
                </Text>
                <Text className="font-caption text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(notification.date)}
                </Text>
              </View>
            </View>

            <View className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800">
              <Text className="font-body text-base text-slate-900 dark:text-white leading-7">
                {notification.texte}
              </Text>
            </View>

            <View className="flex-row items-center justify-between p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30">
              <View className="flex-row items-center space-x-2">
                <Icon name="solar:check-read-linear" color="#00A859" size={20} />
                <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Statut : Lue
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
