import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationsApi, NotificationBackendItem } from '../services/notifications.api';
import { toast } from '../../../shared/store/toastStore';
import { storage } from '../../../shared/services/storage';
import i18next from 'i18next';

export type NotificationTabFilter = 'all' | 'unread';

const NOTIFS_CACHE_KEY = 'kwismo_notifications_cache_v1';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationBackendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<NotificationTabFilter>('all');

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      const cached = await storage.getItem(NOTIFS_CACHE_KEY);
      if (!cached) {
        setLoading(true);
      }
    }
    try {
      const res = await notificationsApi.getNotifications(1, 50);
      if (res.success && res.data) {
        const list = res.data.items || [];
        setNotifications(list);
        setUnreadCount(list.filter((item) => !item.lu).length);
        await storage.setItem(NOTIFS_CACHE_KEY, JSON.stringify(list)).catch(() => {});
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    storage.getItem(NOTIFS_CACHE_KEY).then((cachedStr) => {
      if (cachedStr) {
        try {
          const list = JSON.parse(cachedStr);
          if (Array.isArray(list) && list.length > 0) {
            setNotifications(list);
            setUnreadCount(list.filter((item: any) => !item.lu).length);
            setLoading(false);
          }
        } catch {}
      }
    });
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, lu: true } : item));
      storage.setItem(NOTIFS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, lu: true }));
      storage.setItem(NOTIFS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    setUnreadCount(0);

    try {
      const res = await notificationsApi.markAllAsRead();
      if (res.success) {
        toast.success(i18next.t('notifications.markedAllRead'));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotif = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.setItem(NOTIFS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (target && !target.lu) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      const res = await notificationsApi.deleteNotification(id);
      if (res.success) {
        toast.success('Notification supprimée.');
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.lu);
    }
    return notifications;
  }, [notifications, activeTab]);

  return {
    notifications: filteredNotifications,
    rawNotifications: notifications,
    loading,
    refreshing,
    unreadCount,
    activeTab,
    setActiveTab,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotif,
  };
}
