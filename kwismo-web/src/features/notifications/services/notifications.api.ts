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
        items: [
          {
            id: '1',
            texte: 'Appel suspect détecté de +237690000005.',
            lu: false,
            date: new Date().toISOString(),
          },
          {
            id: '2',
            texte: 'Mise à jour de la grille des seuils de risque IA effectuée.',
            lu: true,
            date: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ],
        total: 2,
        page: 1,
        page_size: 20,
        pages: 1,
      };
    }
  },
};
