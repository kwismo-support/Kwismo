import { ApiClient } from '../../../shared/services/apiClient';

export interface UserMeResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  indicatif_pays?: string;
  email_verifie?: boolean;
  statut?: string;
  role: string;
  langue: string;
  date_inscription?: string;
  photo_url?: string;
  kpi?: {
    numeros_verifies?: number;
    signalements_effectues?: number;
    transferts_proteges?: number;
  };
}

export interface UserUpdatePayload {
  nom?: string;
  prenom?: string;
  email?: string;
  photo_url?: string;
  langue?: string;
  telephone?: string;
  indicatif_pays?: string;
}

export const profileApi = {
  async getProfile() {
    return ApiClient.request<UserMeResponse>('/users/me', {
      method: 'GET',
    });
  },

  async updateProfile(payload: UserUpdatePayload) {
    return ApiClient.request<UserMeResponse>('/users/me', {
      method: 'PATCH',
      body: payload,
    });
  },

  async logout() {
    return ApiClient.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};
