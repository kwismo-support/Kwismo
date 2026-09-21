import { ApiClient } from '../../../shared/services/apiClient';
import { offlineQueue } from '../../../shared/services/offlineQueue';

export interface PrepareTransactionPayload {
  numero: string;
  montant: number;
  operator_id: string;
  ussd_action_id: string;
}

export interface TransactionOut {
  id: string;
  numero_id: string;
  montant: number;
  date_transaction: string;
  statut: string;
  niveau_risque?: string;
  code_ussd_genere?: string;
}

export interface UssdOperator {
  id: string;
  nom: string;
  code: string;
  country_id: string;
}

export interface UssdAction {
  id: string;
  nom: string;
  pattern_code: string;
  operator_id: string;
}

export const transferApi = {
  async getOperators() {
    return ApiClient.request<UssdOperator[]>('/ussd/operators', {
      method: 'GET',
    });
  },

  async getActions(operator_id?: string) {
    const endpoint = operator_id ? `/ussd-actions?operator=${operator_id}` : '/ussd-actions';
    return ApiClient.request<UssdAction[]>(endpoint, {
      method: 'GET',
    });
  },

  async prepareTransfer(payload: PrepareTransactionPayload) {
    const res = await ApiClient.request<TransactionOut>('/transactions/prepare', {
      method: 'POST',
      body: payload,
    });

    if (!res.success && res.errorCode === 'NETWORK_ERROR') {
      await offlineQueue.enqueue(
        'transfer',
        '/transactions/prepare',
        'POST',
        payload,
        'Demande de transfert enregistrée hors-ligne. Elle sera synchronisée au retour de la connexion !'
      );
      return {
        success: true,
        message: 'Demande enregistrée hors-ligne',
        data: {
          id: `offline-tx-${Date.now()}`,
          numero_id: payload.numero,
          montant: payload.montant,
          date_transaction: new Date().toISOString(),
          statut: 'pending_offline',
        },
      };
    }

    return res;
  },

  async getTransactions() {
    return ApiClient.request<{ items: TransactionOut[] }>('/transactions', {
      method: 'GET',
    });
  },
};
