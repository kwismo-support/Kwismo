// Service API backend pour la gestion du profil utilisateur et des paramètres
import { ApiClient } from '../../../shared/services/apiClient';

export interface UserMeResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  email_verifie: boolean;
  statut: string;
  role: string;
  langue: string;
  date_inscription: string;
  kpi: {
    numeros_verifies: number;
    signalements_effectues: number;
    transferts_proteges: number;
  };
  devices: Array<{
    id: string;
    nom: string;
    premiere_connexion: string;
    derniere_connexion: string;
  }>;
}

export interface UserUpdatePayload {
  nom?: string;
  prenom?: string;
  langue?: string;
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
};

