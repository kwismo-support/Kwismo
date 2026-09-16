import { apiClient } from '@/shared/lib/axios';

export interface CountryItem {
  id: string;
  nom: string;
  code_pays: string;
  est_par_defaut: boolean;
}

export interface CountryIn {
  nom: string;
  code_pays: string;
  est_par_defaut?: boolean;
}

export interface OperatorPrefix {
  id?: string;
  prefixe: string;
}

export interface OperatorItem {
  id: string;
  nom: string;
  country_id: string;
  prefixes: OperatorPrefix[];
}

export interface OperatorIn {
  nom: string;
  country_id: string;
  prefixes: string[];
}

export interface UssdActionItem {
  id: string;
  operator_id: string;
  nom_action: string;
  code_ussd: string;
  format: string;
}

export interface UssdActionIn {
  operator_id: string;
  nom_action: string;
  code_ussd: string;
  format: string;
}

export const ussdApi = {
  getCountries: async (): Promise<CountryItem[]> => {
    const res = await apiClient.get('/countries');
    return res.data || [];
  },

  createCountry: async (payload: CountryIn): Promise<CountryItem> => {
    const res = await apiClient.post('/countries', payload);
    return res.data;
  },

  updateCountry: async (id: string, payload: CountryIn): Promise<CountryItem> => {
    const res = await apiClient.patch(`/countries/${id}`, payload);
    return res.data;
  },

  deleteCountry: async (id: string): Promise<void> => {
    await apiClient.delete(`/countries/${id}`);
  },

  getOperators: async (countryId: string): Promise<OperatorItem[]> => {
    const res = await apiClient.get('/operators', {
      params: { country: countryId },
    });
    return res.data || [];
  },

  createOperator: async (payload: OperatorIn): Promise<OperatorItem> => {
    const res = await apiClient.post('/operators', payload);
    return res.data;
  },

  updateOperator: async (id: string, payload: OperatorIn): Promise<OperatorItem> => {
    const res = await apiClient.patch(`/operators/${id}`, payload);
    return res.data;
  },

  deleteOperator: async (id: string): Promise<void> => {
    await apiClient.delete(`/operators/${id}`);
  },

  getActions: async (operatorId: string): Promise<UssdActionItem[]> => {
    const res = await apiClient.get('/ussd-actions', {
      params: { operator: operatorId },
    });
    return res.data || [];
  },

  createAction: async (payload: UssdActionIn): Promise<UssdActionItem> => {
    const res = await apiClient.post('/ussd-actions', payload);
    return res.data;
  },

  updateAction: async (id: string, payload: UssdActionIn): Promise<UssdActionItem> => {
    const res = await apiClient.patch(`/ussd-actions/${id}`, payload);
    return res.data;
  },

  deleteAction: async (id: string): Promise<void> => {
    await apiClient.delete(`/ussd-actions/${id}`);
  },
};
