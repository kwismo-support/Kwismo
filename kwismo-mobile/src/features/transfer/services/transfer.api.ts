// Service API backend pour la préparation des transferts protégés via FastAPI (/transactions et /ussd)
import { ApiClient } from '../../../shared/services/apiClient';

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
    const endpoint = operator_id ? `/ussd/actions?operator_id=${operator_id}` : '/ussd/actions';
    return ApiClient.request<UssdAction[]>(endpoint, {
      method: 'GET',
    });
  },

  async prepareTransfer(payload: PrepareTransactionPayload) {
    return ApiClient.request<TransactionOut>('/transactions/prepare', {
      method: 'POST',
      body: payload,
    });
  },

  async getTransactions() {
    return ApiClient.request<{ items: TransactionOut[] }>('/transactions', {
      method: 'GET',
    });
  },
};

