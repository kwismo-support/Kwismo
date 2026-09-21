import { ApiClient } from '../../../shared/services/apiClient';

export interface ChangePasswordPayload {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface DeviceItem {
  id: string;
  identifiant: string;
  nom: str;
  date_premiere_connexion: string;
  date_derniere_connexion: string;
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
    const res = await ApiClient.request<DeviceItem[]>('/devices', {
      method: 'GET',
      silent: true,
    });
    if (res.success && Array.isArray(res.data)) {
      const mapped: ActiveSessionResponse[] = res.data.map((dev, idx) => ({
        id: dev.id,
        device_name: dev.nom || dev.identifiant || 'Appareil KWISMO',
        device_type: dev.nom?.toLowerCase().includes('android') || dev.nom?.toLowerCase().includes('ios') || dev.nom?.toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
        location: 'Appareil vérifié',
        ip_address: dev.identifiant || '',
        last_active: dev.date_derniere_connexion ? new Date(dev.date_derniere_connexion).toLocaleString() : 'Récemment',
        is_current: idx === 0,
      }));
      return { ...res, data: mapped };
    }
    return { success: res.success, data: [] as ActiveSessionResponse[], message: res.message };
  },

  async revokeSession(sessionId: string) {
    return ApiClient.request<{ message: string }>(`/devices/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async revokeAllOtherSessions() {
    return ApiClient.request<{ message: string }>('/devices', {
      method: 'DELETE',
      silent: true,
    });
  },

  async enableTwoFactor() {
    return ApiClient.request<TwoFactorInitResponse>('/users/me/2fa/enable', {
      method: 'POST',
      silent: true,
    });
  },

  async verifyTwoFactor(code: string) {
    return ApiClient.request<{ message: string }>('/users/me/2fa/verify', {
      method: 'POST',
      body: { code },
      silent: true,
    });
  },

  async disableTwoFactor() {
    return ApiClient.request<{ message: string }>('/users/me/2fa/disable', {
      method: 'DELETE',
      silent: true,
    });
  },
};
