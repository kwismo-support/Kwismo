import { apiClient } from '@/shared/lib/axios';

export interface ReportItem {
  id: string;
  user_id: string;
  numero_id: string;
  motif: string;
  date_signalement: string;
  statut: string;
}

export const reportsApi = {
  getReports: async (page = 1, pageSize = 50): Promise<{ items: ReportItem[]; total: number }> => {
    try {
      const res = await apiClient.get(`/reports?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },

  validateReport: async (id: string, status: 'validated' | 'rejected'): Promise<ReportItem> => {
    const res = await apiClient.patch(`/reports/${id}/validate`, { statut: status });
    return res.data;
  },
};
