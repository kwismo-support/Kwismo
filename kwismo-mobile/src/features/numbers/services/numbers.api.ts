// Service API backend pour la gestion des cartes SIM et numéros de l'utilisateur
import { ApiClient } from '../../../shared/services/apiClient';

export interface SimNumber {
  id: string;
  phone: string;
  operator: 'MTN' | 'ORANGE' | 'NEXTTEL' | 'CAMTEL';
  status: 'active' | 'compromised' | 'pending';
  addedAt: string;
  isPrimary?: boolean;
}

export const numbersApi = {
  async getMyNumbers() {
    return ApiClient.request<SimNumber[]>('/my-numbers', {
      method: 'GET',
      mockDataFallback: [
        { id: 'sim-1', phone: '+237699001122', operator: 'MTN', status: 'active', addedAt: '2026-01-15', isPrimary: true },
        { id: 'sim-2', phone: '+237677889900', operator: 'ORANGE', status: 'compromised', addedAt: '2026-02-10', isPrimary: false },
      ],
    });
  },

  async addNumber(payload: { phone: string; operator: string }) {
    return ApiClient.request<SimNumber>('/my-numbers', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        id: 'sim-' + Date.now(),
        phone: payload.phone,
        operator: payload.operator as any,
        status: 'active',
        addedAt: new Date().toISOString(),
      },
    });
  },

  async markAsCompromised(id: string) {
    return ApiClient.request<SimNumber>(`/my-numbers/${id}/compromised`, {
      method: 'PUT',
      mockDataFallback: {
        id,
        phone: '+237677889900',
        operator: 'ORANGE',
        status: 'compromised',
        addedAt: '2026-02-10',
      },
    });
  },
};
