import { apiClient } from '@/shared/lib/axios';

export interface DeviceSummary {
  id: string;
  nom: string;
  premiere_connexion: string;
  derniere_connexion: string;
}

export interface UserKpi {
  numeros_verifies: number;
  signalements_effectues: number;
  transferts_proteges: number;
}

export interface UserProfileMe {
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
  devices: DeviceSummary[];
}

export interface ProfileUpdateIn {
  nom?: string;
  prenom?: string;
  langue?: string;
}

export const profileApi = {
  getMe: async (): Promise<UserProfileMe> => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  updateMe: async (payload: ProfileUpdateIn): Promise<UserProfileMe> => {
    const res = await apiClient.patch('/users/me', payload);
    return res.data;
  },
};
