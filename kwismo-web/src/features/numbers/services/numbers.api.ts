import { apiClient } from '@/shared/lib/axios';

export interface NumberItem {
  id: string;
  valeur: string;
  score_risque: number;
  statut: string;
  date_derniere_verification?: string;
  country_id?: string;
  operator_id?: string;
  nombre_signalements?: number;
}

export const numbersApi = {
  getNumbers: async (page = 1, pageSize = 50, statut?: string): Promise<{ items: NumberItem[]; total: number }> => {
    try {
      const url = statut ? `/numbers?page=${page}&page_size=${pageSize}&statut=${statut}` : `/numbers?page=${page}&page_size=${pageSize}`;
      const res = await apiClient.get(url);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },

  getNumberById: async (id: string): Promise<NumberItem | null> => {
    try {
      const res = await apiClient.get(`/numbers/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  verifyNumber: async (valeur: string): Promise<NumberItem> => {
    const res = await apiClient.post('/numbers/verify', { valeur });
    return res.data;
  },

  setNumberStatus: async (id: string, statut: string, reanalyser = false): Promise<NumberItem> => {
    const res = await apiClient.patch(`/numbers/${id}/status`, { statut, reanalyser });
    return res.data;
  },
};
