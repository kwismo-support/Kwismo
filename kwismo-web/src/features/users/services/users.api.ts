import { apiClient } from '@/shared/lib/axios';

export interface UserPhoneSummary {
  id: string;
  valeur: string;
  est_verifie: boolean;
  est_compromis: boolean;
}

export interface UserDeviceSummary {
  id: string;
  nom: string;
  premiere_connexion: string;
  derniere_connexion: string;
}

export interface UserItem {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  nombre_numeros?: number;
  role?: string;
  langue?: string;
  date_inscription?: string;
  createdAt?: string;
  numeros?: UserPhoneSummary[];
  devices?: UserDeviceSummary[];
}

export interface UsersPageResponse {
  items: UserItem[];
  total: number;
  page?: number;
  page_size?: number;
  pages?: number;
}

export const usersApi = {
  getUsers: async (page = 1, pageSize = 20): Promise<UsersPageResponse> => {
    try {
      const res = await apiClient.get(`/users?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize,
        pages: data.pages || 1,
      };
    } catch {
      return { items: [], total: 0 };
    }
  },

  getUserById: async (id: string): Promise<UserItem | null> => {
    try {
      const res = await apiClient.get(`/users/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  updateUserStatus: async (id: string, status: string): Promise<UserItem> => {
    const res = await apiClient.patch(`/users/${id}/status`, { statut: status });
    return res.data;
  },

  getMe: async (): Promise<UserItem | null> => {
    try {
      const res = await apiClient.get('/users/me');
      return res.data;
    } catch {
      return null;
    }
  },

  updateMe: async (payload: { nom?: string; prenom?: string; langue?: string }): Promise<UserItem> => {
    const res = await apiClient.patch('/users/me', payload);
    return res.data;
  },
};
