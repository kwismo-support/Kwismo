import { ApiClient } from '../../../shared/services/apiClient';
import { activityHistoryService } from '../../../shared/services/activityHistoryService';

export interface DashboardActivity {
  id: string;
  phone: string;
  type: string;
  category: 'verified' | 'threats' | 'reports' | 'transfers';
  status: string;
  badgeType: 'green' | 'red' | 'yellow' | 'blue';
  date: string;
  timestamp?: number;
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
      const [meRes, txRes, phonesRes, localActivities] = await Promise.all([
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
        activityHistoryService.getActivities(),
      ]);

      const kpi = meRes.data?.kpi || {
        numeros_verifies: 0,
        signalements_effectues: 0,
        transferts_proteges: 0,
      };

      const phones = phonesRes.data || [];
      const compromisedCount = phones.filter((p) => p.est_compromis).length;

      const transactions = txRes.data?.items || [];
      const remoteActivities: DashboardActivity[] = transactions.map((tx, idx) => {
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

      const combinedMap = new Map<string, DashboardActivity>();
      localActivities.forEach((act) => combinedMap.set(act.id, act));
      remoteActivities.forEach((act) => {
        if (!combinedMap.has(act.id)) {
          combinedMap.set(act.id, act);
        }
      });

      const recentActivities = Array.from(combinedMap.values());

      return {
        success: meRes.success || localActivities.length > 0,
        data: {
          numeros_verifies: Math.max(kpi.numeros_verifies || 0, phones.filter((p) => p.est_verifie).length, localActivities.filter((a) => a.category === 'verified').length),
          threats_avoided: Math.max(compromisedCount, localActivities.filter((a) => a.category === 'threats').length),
          signalements_effectues: Math.max(kpi.signalements_effectues || 0, localActivities.filter((a) => a.category === 'reports').length),
          transferts_proteges: Math.max(kpi.transferts_proteges || 0, transactions.length, localActivities.filter((a) => a.category === 'transfers').length),
          recentActivities,
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
