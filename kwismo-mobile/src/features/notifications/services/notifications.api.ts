// Service API backend pour la gestion des notifications utilisateur
import { ApiClient } from '../../../shared/services/apiClient';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'security' | 'transaction' | 'system';
}

export const notificationsApi = {
  async getNotifications() {
    return ApiClient.request<AppNotification[]>('/notifications', {
      method: 'GET',
      mockDataFallback: [
        {
          id: 'n1',
          title: 'Alerte de sécurité',
          message: 'Une nouvelle tentative de connexion a été détectée.',
          timestamp: 'Il y a 2h',
          isRead: false,
          type: 'security',
        },
        {
          id: 'n2',
          title: 'Transfert réussi',
          message: 'Votre transfert de 15 000 FCFA a été effectué.',
          timestamp: 'Hier',
          isRead: true,
          type: 'transaction',
        },
      ],
    });
  },

  async markAsRead(id: string) {
    return ApiClient.request<AppNotification>(`/notifications/${id}/read`, {
      method: 'PUT',
      mockDataFallback: {
        id,
        title: '',
        message: '',
        timestamp: '',
        isRead: true,
        type: 'system',
      },
    });
  },
};
