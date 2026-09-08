// Hook React pour charger et gérer les notifications de l'application
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, AppNotification } from '../services/notifications.api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setError(res.message || 'Erreur lors du chargement des notifications');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    await notificationsApi.markAsRead(id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, error, refresh: fetchNotifications, markRead, unreadCount };
}
