// Service API backend pour envoyer l'alerte WhatsApp aux contacts
import { ApiClient } from '../../../shared/services/apiClient';

export interface WhatsappAlertPayload {
  compromisedNumber: string;
  recipients: string[];
  customMessage?: string;
}

export const whatsappApi = {
  async sendAlert(payload: WhatsappAlertPayload) {
    return ApiClient.request<{ sentCount: number; status: string }>('/whatsapp-alert', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        sentCount: payload.recipients.length,
        status: 'success',
      },
    });
  },
};
