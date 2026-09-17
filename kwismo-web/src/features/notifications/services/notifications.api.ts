import { apiClient } from '@/shared/lib/axios';

export interface NotificationItem {
  id: string;
  texte: string;
  lu: boolean;
  date: string;
}

export interface PaginatedNotificationsResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export const notificationsApi = {
  getNotifications: async (page = 1, pageSize = 20): Promise<PaginatedNotificationsResponse> => {
    try {
      const res = await apiClient.get('/notifications', {
        params: { page, page_size: pageSize },
      });
      return res.data;
    } catch {
      return {
        items: [],
        total: 0,
        page: 1,
        page_size: pageSize,
        pages: 1,
      };
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {}
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch {}
  },
};
