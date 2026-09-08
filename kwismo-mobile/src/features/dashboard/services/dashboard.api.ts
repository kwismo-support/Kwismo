// Service API backend pour le tableau de bord (KPIs, activités récentes)
import { ApiClient } from '../../../shared/services/apiClient';

export interface DashboardSummary {
  activeNumbersCount: number;
  compromisedNumbersCount: number;
  totalTransactionsMonth: number;
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'transaction' | 'alert' | 'security';
  }>;
}

export const dashboardApi = {
  async getSummary() {
    return ApiClient.request<DashboardSummary>('/dashboard/summary', {
      method: 'GET',
      mockDataFallback: {
        activeNumbersCount: 3,
        compromisedNumbersCount: 1,
        totalTransactionsMonth: 145000,
        recentActivities: [
          {
            id: '1',
            title: 'Signalement WhatsApp',
            description: 'Numéro +237699001122 marqué comme compromis',
            timestamp: 'Il y a 10 min',
            type: 'alert',
          },
          {
            id: '2',
            title: 'Transfert effectué',
            description: '25,000 FCFA vers +237677889900',
            timestamp: 'Hier, 14:30',
            type: 'transaction',
          },
        ],
      },
    });
  },
};
