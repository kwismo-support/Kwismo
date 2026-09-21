import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { notificationsApi, NotificationItem } from '../services/notifications.api';
import { toast } from '../../../shared/store/toastStore';
import { storage } from '../../../shared/services/storage';

const NOTIFICATIONS_CACHE_KEY = 'kwismo_notifications_cache';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        const items = res.data.items || [];
        setNotifications(items);
        await storage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(items)).catch(() => {});
      } else if (isManualRefresh) {
        setError(res.message || i18next.t('errors.generalMessage'));
      }
    } catch (err: any) {
      if (isManualRefresh) setError(err.message || i18next.t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // 1. Instant local cache load (0ms)
      const cachedStr = await storage.getItem(NOTIFICATIONS_CACHE_KEY);
      if (cachedStr && isMounted) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
            setLoading(false);
          }
        } catch {}
      }

      // 2. Background sync
      await fetchNotifications(false);
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update + local storage update
    const updated = notifications.map((item) => (item.id === id ? { ...item, est_lue: true } : item));
    setNotifications(updated);
    storage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});

    try {
      return await notificationsApi.markAsRead(id);
    } catch {
      return { success: false };
    }
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, est_lue: true }));
    setNotifications(updated);
    storage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});

    toast.success(i18next.t('notifications.markedAllRead'));

    try {
      await notificationsApi.markAllAsRead();
    } catch {}
  };

  return {
    notifications,
    loading,
    error,
    refresh: () => fetchNotifications(true),
    markAsRead,
    markAllAsRead,
  };
}
