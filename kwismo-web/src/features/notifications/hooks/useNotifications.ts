import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../services/notifications.api';
import type { NotificationItem } from '../services/notifications.api';
import { toast } from '@/shared/store/toastStore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getNotifications(page, pageSize);
      setNotifications(data.items || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
    await notificationsApi.markAsRead(id);
    toast.success('Notification marquée comme lue');
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    await notificationsApi.markAllAsRead();
    toast.success('Toutes les notifications ont été marquées comme lues');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.lu;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.lu).length;

  return {
    notifications: filteredNotifications,
    rawNotifications: notifications,
    total,
    unreadCount,
    page,
    setPage,
    loading,
    filter,
    setFilter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
