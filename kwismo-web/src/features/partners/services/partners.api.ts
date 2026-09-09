import { apiClient } from '@/shared/lib/axios';

export interface PartnerItem {
  id: string;
  nomEntreprise: string;
  typePartenariat: string;
  dateAdhesion?: string;
  createdAt?: string;
  usersCount?: number;
  numbersCount?: number;
}

export const partnersApi = {
  getPartners: async (page = 1, pageSize = 50): Promise<{ items: PartnerItem[]; total: number }> => {
    try {
      const res = await apiClient.get(`/partners?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },

  getPartnerById: async (id: string): Promise<PartnerItem | null> => {
    try {
      const res = await apiClient.get(`/partners/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createPartner: async (payload: { nomEntreprise: string; typePartenariat: string }): Promise<PartnerItem> => {
    const res = await apiClient.post('/partners', payload);
    return res.data;
  },
};
