// Service API backend pour la préparation et la validation des transferts d'argent
import { ApiClient } from '../../../shared/services/apiClient';

export interface PrepareTransferPayload {
  senderNumber: string;
  recipientNumber: string;
  amount: number;
  provider: 'MTN' | 'ORANGE';
}

export interface PrepareTransferResponse {
  transactionId: string;
  ussdCode: string;
  fee: number;
  status: 'prepared' | 'pending' | 'success';
}

export const transferApi = {
  async prepareTransfer(payload: PrepareTransferPayload) {
    return ApiClient.request<PrepareTransferResponse>('/transactions/prepare', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        transactionId: 'tx-' + Date.now(),
        ussdCode: payload.provider === 'MTN' ? `*126*1*${payload.recipientNumber}*${payload.amount}#` : `*150*1*${payload.recipientNumber}*${payload.amount}#`,
        fee: payload.amount * 0.01,
        status: 'prepared',
      },
    });
  },

  async confirmTransfer(transactionId: string) {
    return ApiClient.request<{ status: string }>('/transactions/confirm', {
      method: 'POST',
      body: { transactionId },
      mockDataFallback: { status: 'success' },
    });
  },
};
