import { ApiClient } from '../../../shared/services/apiClient';
import { offlineQueue } from '../../../shared/services/offlineQueue';

export interface ReportPayload {
  numero: string;
  motif: string;
}

export interface ReportResponse {
  id: string;
  user_id: string;
  numero_id: string;
  motif: string;
  date_signalement: string;
  statut: string;
}

export const reportApi = {
  async submitReport(payload: ReportPayload) {
    const body = {
      numero: payload.numero.trim(),
      motif: payload.motif.trim(),
    };

    const res = await ApiClient.request<ReportResponse>('/reports', {
      method: 'POST',
      body,
      silent: false,
    });

    if (!res.success && res.errorCode === 'NETWORK_ERROR') {
      await offlineQueue.enqueue(
        'report',
        '/reports',
        'POST',
        body,
        'Signalement enregistré hors-ligne. Il sera transmis au serveur dès le retour du réseau !'
      );
      return {
        success: true,
        message: 'Signalement sauvegardé hors-ligne',
        data: {
          id: `offline-${Date.now()}`,
          user_id: 'me',
          numero_id: body.numero,
          motif: body.motif,
          date_signalement: new Date().toISOString(),
          statut: 'pending_offline',
        },
      };
    }

    return res;
  },
};
