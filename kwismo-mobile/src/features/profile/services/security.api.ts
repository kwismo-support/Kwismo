import { ApiClient } from '../../../shared/services/apiClient';
import { getRealDeviceName, getDevicePhysicalLocation, formatDeviceName } from '../../../shared/utils/deviceHelper';

export interface ChangePasswordPayload {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

export interface DeviceItem {
  id: string;
  identifiant: string;
  nom: string;
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

const buildCurrentSession = (): ActiveSessionResponse => ({
  id: 'current-session-id',
  device_name: getRealDeviceName(),
  device_type: 'mobile',
  location: getDevicePhysicalLocation(),
  ip_address: 'Localisation GPS Appareil',
  last_active: 'En cours (Maintenant)',
  is_current: true,
});

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

    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const mapped: ActiveSessionResponse[] = res.data.map((dev, idx) => {
        const isCurrent = idx === 0;
        const isMobile = true; // On the mobile app, device is a phone
        return {
          id: dev.id,
          device_name: isCurrent ? getRealDeviceName() : formatDeviceName(dev.nom || dev.identifiant),
          device_type: 'mobile',
          location: isCurrent ? getDevicePhysicalLocation() : 'Appareil vérifié',

          ip_address: isCurrent ? 'Localisation GPS Appareil' : (dev.identifiant && !dev.identifiant.includes('kwismo-device') ? dev.identifiant : 'Cameroun'),
          last_active: isCurrent ? 'En cours (Maintenant)' : (dev.date_derniere_connexion ? new Date(dev.date_derniere_connexion).toLocaleString('fr-FR') : 'Récemment'),
          is_current: isCurrent,
        };
      });
      return { ...res, data: mapped };
    }

    return {
      success: true,
      data: [buildCurrentSession()],
      message: res.message,
    };
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
