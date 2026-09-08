// Service API backend pour soumettre des signalements de fraude / numéros suspects
import { ApiClient } from '../../../shared/services/apiClient';

export interface ReportPayload {
  targetPhone: string;
  category: 'spam' | 'fraud' | 'impersonation' | 'whatsapp';
  description: string;
  evidenceUrl?: string;
}

export const reportApi = {
  async submitReport(payload: ReportPayload) {
    return ApiClient.request<{ id: string; status: string }>('/reports', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        id: 'rep-' + Date.now(),
        status: 'pending',
      },
    });
  },
};
