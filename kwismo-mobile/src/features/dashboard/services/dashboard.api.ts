// Service API backend pour le tableau de bord (KPIs, activités récentes)
import { ApiClient } from '../../../shared/services/apiClient';

export interface DashboardSummary {
  numeros_verifies: number;
  signalements_effectues: number;
  transferts_proteges: number;
  recentActivities: Array<{
    id: string;
    phone: string;
    type: string;
    status: string;
    badgeType: 'green' | 'red' | 'yellow' | 'blue';
    date: string;
  }>;
}

export const dashboardApi = {
  async getSummary() {
    const meRes = await ApiClient.request<{ kpi: { numeros_verifies: number; signalements_effectues: number; transferts_proteges: number } }>('/users/me', {
      method: 'GET',
    });

    const txRes = await ApiClient.request<{ items: Array<{ id: string; numero_id: string; montant: number; date_transaction: string; statut: string }> }>('/transactions', {
      method: 'GET',
      silent: true,
    });

    const kpi = meRes.data?.kpi || { numeros_verifies: 0, signalements_effectues: 0, transferts_proteges: 0 };
    const transactions = txRes.data?.items || [];

    const recentActivities = transactions.slice(0, 6).map((tx, idx) => ({
      id: tx.id || `tx-${idx}`,
      phone: tx.numero_id || '+237 6 00 00 00 00',
      type: 'Transfert d\'argent',
      status: tx.statut === 'confirmed' ? 'Protégé' : 'En cours',
      badgeType: (tx.statut === 'confirmed' ? 'green' : 'yellow') as 'green' | 'yellow',
      date: new Date(tx.date_transaction || Date.now()).toLocaleDateString('fr-FR'),
    }));

    return {
      success: meRes.success,
      data: {
        numeros_verifies: kpi.numeros_verifies,
        signalements_effectues: kpi.signalements_effectues,
        transferts_proteges: kpi.transferts_proteges,
        recentActivities,
      },
    };
  },
};

