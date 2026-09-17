import { ApiClient } from '../../../shared/services/apiClient';

export interface DashboardActivity {
  id: string;
  phone: string;
  type: string;
  category: 'verified' | 'threats' | 'reports' | 'transfers';
  status: string;
  badgeType: 'green' | 'red' | 'yellow' | 'blue';
  date: string;
  initials?: string;
  initialBg?: string;
}

export interface DashboardSummary {
  numeros_verifies: number;
  threats_avoided: number;
  signalements_effectues: number;
  transferts_proteges: number;
  recentActivities: DashboardActivity[];
}

export const dashboardApi = {
  async getSummary(): Promise<{ success: boolean; data?: DashboardSummary; message?: string }> {
    try {
      const [meRes, txRes, phonesRes] = await Promise.all([
        ApiClient.request<{
          kpi: {
            numeros_verifies: number;
            signalements_effectues: number;
            transferts_proteges: number;
          };
        }>('/users/me', { method: 'GET', silent: true }),
        ApiClient.request<{
          items: Array<{
            id: string;
            valeur_numero?: string;
            numero_id?: string;
            nom_destinataire?: string;
            montant?: number;
            date_transaction?: string;
            statut?: string;
            score_risque?: number;
          }>;
        }>('/transactions?page=1&page_size=10', { method: 'GET', silent: true }),
        ApiClient.request<Array<{
          id: string;
          valeur: string;
          est_verifie: boolean;
          est_compromis: boolean;
        }>>('/users/me/phones', { method: 'GET', silent: true }),
      ]);

      const kpi = meRes.data?.kpi || {
        numeros_verifies: 0,
        signalements_effectues: 0,
        transferts_proteges: 0,
      };

      const phones = phonesRes.data || [];
      const compromisedCount = phones.filter((p) => p.est_compromis).length;

      const transactions = txRes.data?.items || [];
      const activities: DashboardActivity[] = transactions.map((tx, idx) => {
        const phoneDisplay = tx.valeur_numero || tx.nom_destinataire || tx.numero_id || '';
        const isConfirmed = tx.statut === 'confirmed' || tx.statut === 'completed';
        const isFailedOrFraud = tx.statut === 'blocked' || tx.statut === 'failed' || (tx.score_risque && tx.score_risque > 70);

        let badgeType: 'green' | 'red' | 'yellow' | 'blue' = 'green';
        let category: 'verified' | 'threats' | 'reports' | 'transfers' = 'transfers';
        let statusText = 'common.protected';

        if (isFailedOrFraud) {
          badgeType = 'red';
          category = 'threats';
          statusText = 'common.detected';
        } else if (!isConfirmed) {
          badgeType = 'yellow';
          statusText = 'common.inProgress';
        }

        const dateStr = tx.date_transaction
          ? new Date(tx.date_transaction).toLocaleDateString()
          : '';

        let initials = '';
        if (tx.nom_destinataire) {
          const parts = tx.nom_destinataire.trim().split(' ');
          initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0]?.toUpperCase() || '';
        }

        return {
          id: tx.id || `tx-${idx}`,
          phone: phoneDisplay,
          type: 'common.actionTransfer',
          category,
          status: statusText,
          badgeType,
          date: dateStr,
          initials,
        };
      });

      return {
        success: meRes.success,
        data: {
          numeros_verifies: kpi.numeros_verifies || phones.filter((p) => p.est_verifie).length,
          threats_avoided: compromisedCount,
          signalements_effectues: kpi.signalements_effectues || 0,
          transferts_proteges: kpi.transferts_proteges || transactions.length,
          recentActivities: activities,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },
};
