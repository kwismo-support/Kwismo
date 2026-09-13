// Hook React pour la gestion et le marquage des notifications
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsApi, NotificationItem } from '../services/notifications.api';
import { toast } from '../../../shared/store/toastStore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur des notifications.'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await notificationsApi.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, est_lue: true } : item))
        );
      }
      return res;
    } catch {
      return { success: false };
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.est_lue);
    await Promise.all(unread.map((n) => notificationsApi.markAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, est_lue: true })));
    toast.success(t('notifications.markedAllRead', 'Toutes les notifications lues.'));
  };

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
