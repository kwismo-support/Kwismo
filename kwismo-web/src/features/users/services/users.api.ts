import { apiClient } from '@/shared/lib/axios';

export interface UserItem {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  langue: string;
  dateInscription?: string;
  createdAt?: string;
  role: { id: string; nomRole: string } | string;
  partnerId?: string;
  partner?: { id: string; nomEntreprise: string };
}

export const usersApi = {
  getUsers: async (page = 1, pageSize = 50): Promise<{ items: UserItem[]; total: number }> => {
    try {
      const res = await apiClient.get(`/users?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
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
};
