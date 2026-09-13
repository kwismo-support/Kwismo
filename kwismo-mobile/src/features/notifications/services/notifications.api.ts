// Service API backend pour les notifications via FastAPI (/notifications)
import { ApiClient } from '../../../shared/services/apiClient';

export interface NotificationItem {
  id: string;
  titre_fr: string;
  titre_en: string;
  message_fr: string;
  message_en: string;
  date_envoi: string;
  est_lue: boolean;
  type_evenement: string;
}

export interface NotificationsPageResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const notificationsApi = {
  async getNotifications(page: number = 1, page_size: number = 20) {
    return ApiClient.request<NotificationsPageResponse>(`/notifications?page=${page}&page_size=${page_size}`, {
      method: 'GET',
    });
  },

  async markAsRead(id: string) {
    return ApiClient.request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

