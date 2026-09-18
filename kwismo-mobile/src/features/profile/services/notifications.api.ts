import { ApiClient } from '../../../shared/services/apiClient';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  alertes_securite: boolean;
  mises_a_jour: boolean;
}

export const notificationsApi = {
  async getPreferences() {
    return ApiClient.request<NotificationPreferences>('/users/me/notification-preferences', {
      method: 'GET',
    });
  },

  async updatePreferences(payload: Partial<NotificationPreferences>) {
    return ApiClient.request<NotificationPreferences>('/users/me/notification-preferences', {
      method: 'PATCH',
      body: payload,
    });
  },

  async registerPushToken(token: string) {
    return ApiClient.request<{ message: string }>('/users/me/push-token', {
      method: 'POST',
      body: { token },
    });
  },

  async unregisterPushToken(token: string) {
    return ApiClient.request<{ message: string }>('/users/me/push-token', {
      method: 'DELETE',
      body: { token },
    });
  },
};
