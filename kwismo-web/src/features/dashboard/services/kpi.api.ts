import { apiClient } from '@/shared/lib/axios';

export interface KpiItem {
  id: string;
  nom_indicateur: string;
  valeur: number;
  periode: string;
  portee: string;
}

export const kpiApi = {
  getGlobalKpi: async (): Promise<KpiItem[]> => {
    const res = await apiClient.get<KpiItem[]>('/kpi/global');
    return res.data;
  },

  getPartnerKpi: async (): Promise<KpiItem[]> => {
    const res = await apiClient.get<KpiItem[]>('/kpi/partner');
    return res.data;
  },
};
