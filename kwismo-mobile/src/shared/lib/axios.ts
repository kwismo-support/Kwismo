import { ApiClient } from '../services/apiClient';

export const axiosInstance = {
  get: (url: string) => ApiClient.request(url, { method: 'GET' }),
  post: (url: string, data?: any) => ApiClient.request(url, { method: 'POST', body: data }),
  put: (url: string, data?: any) => ApiClient.request(url, { method: 'PUT', body: data }),
  delete: (url: string) => ApiClient.request(url, { method: 'DELETE' }),
};
