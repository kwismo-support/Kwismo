// Service API backend pour la gestion du profil utilisateur et des paramètres
import { ApiClient } from '../../../shared/services/apiClient';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  language?: string;
  biometricEnabled?: boolean;
  pinConfigured?: boolean;
}

export const profileApi = {
  async getProfile() {
    return ApiClient.request<UserProfile>('/users/me', {
      method: 'GET',
      mockDataFallback: {
        id: 'usr-me',
        fullName: 'Ismaël KWISMO',
        email: 'ismael@kwismo.cm',
        phone: '+237699001122',
        language: 'fr',
        biometricEnabled: true,
        pinConfigured: true,
      },
    });
  },

  async updateProfile(payload: Partial<UserProfile>) {
    return ApiClient.request<UserProfile>('/users/me', {
      method: 'PUT',
      body: payload,
      mockDataFallback: {
        id: 'usr-me',
        fullName: payload.fullName || 'Ismaël KWISMO',
        email: payload.email || 'ismael@kwismo.cm',
        phone: payload.phone || '+237699001122',
      },
    });
  },

  async updatePassword(payload: { currentPassword?: string; newPassword?: string }) {
    return ApiClient.request<{ message: string }>('/users/me/password', {
      method: 'PUT',
      body: payload,
      mockDataFallback: { message: 'Mot de passe mis à jour avec succès' },
    });
  },

  async updatePin(payload: { currentPin?: string; newPin: string }) {
    return ApiClient.request<{ message: string }>('/users/me/pin', {
      method: 'PUT',
      body: payload,
      mockDataFallback: { message: 'Code PIN mis à jour avec succès' },
    });
  },
};
