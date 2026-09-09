import { apiClient } from '@/shared/lib/axios';

export interface CountryItem {
  id: string;
  nom: string;
  codePays: string;
  estParDefaut: boolean;
}

export interface OperatorItem {
  id: string;
  nom: string;
  countryId: string;
  prefixes?: { prefixe: string }[];
}

export interface UssdActionItem {
  id: string;
  operatorId: string;
  nomAction: string;
  codeUSSD: string;
  format: string;
}

export const ussdApi = {
  getCountries: async (): Promise<CountryItem[]> => {
    try {
      const res = await apiClient.get('/ussd/countries');
      return res.data || [];
    } catch {
      return [];
    }
  },

  getOperators: async (countryId?: string): Promise<OperatorItem[]> => {
    try {
      const url = countryId ? `/ussd/operators?country_id=${countryId}` : '/ussd/operators';
      const res = await apiClient.get(url);
      return res.data || [];
    } catch {
      return [];
    }
  },

  getActions: async (operatorId?: string): Promise<UssdActionItem[]> => {
    try {
      const url = operatorId ? `/ussd/actions?operator_id=${operatorId}` : '/ussd/actions';
      const res = await apiClient.get(url);
      return res.data || [];
    } catch {
      return [];
    }
  },
};
