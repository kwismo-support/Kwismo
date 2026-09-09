import { env } from '@/config/env';
import { apiClient } from './axios';
import {
  MOCK_USERS, MOCK_PARTNERS, MOCK_NUMBERS,
  MOCK_COUNTRIES, MOCK_OPERATORS, MOCK_USSD_ACTIONS,
  MOCK_ROLES, MOCK_PERMISSIONS, MOCK_KPIS, MOCK_REPORTS,
} from '@/shared/mock';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getUsers: async () => {
    if (env.useMock) { await delay(); return MOCK_USERS; }
    return apiClient.get('/users').then((r) => r.data?.items || r.data);
  },

  getPartners: async () => {
    if (env.useMock) { await delay(); return MOCK_PARTNERS; }
    return apiClient.get('/partners').then((r) => r.data?.items || r.data);
  },

  getNumbers: async () => {
    if (env.useMock) { await delay(); return MOCK_NUMBERS; }
    return apiClient.get('/numbers').then((r) => r.data?.items || r.data);
  },

  getCountries: async () => {
    if (env.useMock) { await delay(); return MOCK_COUNTRIES; }
    return apiClient.get('/ussd/countries').then((r) => r.data);
  },

  getOperators: async () => {
    if (env.useMock) { await delay(); return MOCK_OPERATORS; }
    return apiClient.get('/ussd/operators').then((r) => r.data);
  },

  getUssdActions: async () => {
    if (env.useMock) { await delay(); return MOCK_USSD_ACTIONS; }
    return apiClient.get('/ussd/actions').then((r) => r.data);
  },

  getRoles: async () => {
    if (env.useMock) { await delay(); return MOCK_ROLES; }
    return apiClient.get('/access-control/roles').then((r) => r.data);
  },

  getPermissions: async () => {
    if (env.useMock) { await delay(); return MOCK_PERMISSIONS; }
    return apiClient.get('/access-control/permissions').then((r) => r.data);
  },

  getKpiSummary: async () => {
    if (env.useMock) { await delay(); return MOCK_KPIS; }
    return apiClient.get('/kpi/summary').then((r) => r.data);
  },

  getReports: async () => {
    if (env.useMock) { await delay(); return MOCK_REPORTS; }
    return apiClient.get('/reports').then((r) => r.data?.items || r.data);
  },

  verifyNumber: async (valeur: string) => {
    if (env.useMock) {
      await delay();
      const num = MOCK_NUMBERS.find((n) => n.valeur === valeur);
      if (num) return num;
      return {
        id: `num-${Date.now()}`,
        valeur,
        scoreRisque: 5,
        statut: 'securise' as const,
        operatorName: 'Réseau Mobile',
        countryCode: '+237',
        reportsCount: 0,
        dateDerniereVerification: new Date().toISOString(),
      };
    }
    return apiClient.post('/numbers/verify', { valeur }).then((r) => r.data);
  },

  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then((r) => r.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then((r) => r.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then((r) => r.data),

  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((r) => r.data),
};
