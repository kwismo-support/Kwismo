// Service API backend pour soumettre des signalements de fraude avec FastAPI backend (/reports)
import { ApiClient } from '../../../shared/services/apiClient';

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
    return ApiClient.request<ReportResponse>('/reports', {
      method: 'POST',
      body: {
        numero: payload.numero.trim(),
        motif: payload.motif.trim(),
      },
    });
  },
};

