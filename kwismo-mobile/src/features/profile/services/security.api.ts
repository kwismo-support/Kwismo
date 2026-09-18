import { ApiClient } from '../../../shared/services/apiClient';

export interface ChangePasswordPayload {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface ActiveSessionResponse {
  id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop';
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export interface TwoFactorInitResponse {
  secret: string;
  qr_code_url: string;
}

export const securityApi = {
  async changePassword(payload: ChangePasswordPayload) {
    return ApiClient.request<{ message: string }>('/users/me/password', {
      method: 'PUT',
      body: payload,
    });
  },

  async getActiveSessions() {
    return ApiClient.request<ActiveSessionResponse[]>('/users/me/sessions', {
      method: 'GET',
    });
  },

  async revokeSession(sessionId: string) {
    return ApiClient.request<{ message: string }>(`/users/me/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async revokeAllOtherSessions() {
    return ApiClient.request<{ message: string }>('/users/me/sessions/other', {
      method: 'DELETE',
    });
  },

  async enableTwoFactor() {
    return ApiClient.request<TwoFactorInitResponse>('/users/me/2fa/enable', {
      method: 'POST',
    });
  },

  async verifyTwoFactor(code: string) {
    return ApiClient.request<{ message: string }>('/users/me/2fa/verify', {
      method: 'POST',
      body: { code },
    });
  },

  async disableTwoFactor() {
    return ApiClient.request<{ message: string }>('/users/me/2fa/disable', {
      method: 'DELETE',
    });
  },
};
