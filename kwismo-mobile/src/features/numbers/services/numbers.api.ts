// Service API backend pour la gestion des numéros de l'utilisateur via FastAPI (/users/me/phones)
import { ApiClient } from '../../../shared/services/apiClient';

export interface UserPhoneItem {
  id: string;
  user_id: string;
  country_id: string;
  operator_id: string;
  numero_valeur: string;
  est_verifie: boolean;
  est_compromis: boolean;
  statut: string;
}

export const numbersApi = {
  async getMyNumbers() {
    return ApiClient.request<UserPhoneItem[]>('/users/me/phones', {
      method: 'GET',
    });
  },

  async addNumber(payload: { numero_valeur: string; country_id: string; operator_id: string }) {
    return ApiClient.request<UserPhoneItem>('/users/me/phones', {
      method: 'POST',
      body: payload,
    });
  },

  async deleteNumber(phoneId: string) {
    return ApiClient.request<{ message: string }>(`/users/me/phones/${phoneId}`, {
      method: 'DELETE',
    });
  },

  async markAsCompromised(phoneId: string) {
    return ApiClient.request<{ id: string }>(`/users/me/phones/${phoneId}/compromise`, {
      method: 'POST',
    });
  },
};

