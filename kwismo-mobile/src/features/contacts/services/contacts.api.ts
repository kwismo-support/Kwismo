// Service API backend pour la gestion des contacts via FastAPI (/contacts et /contacts/sync)
import { ApiClient } from '../../../shared/services/apiClient';

export interface ContactItem {
  id: string;
  nom: string;
  prenom?: string;
  numero_valeur: string;
  insigne_reputation?: string;
}

export interface ContactsPageResponse {
  items: ContactItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const contactsApi = {
  async getContacts(page: number = 1, page_size: number = 50) {
    return ApiClient.request<ContactsPageResponse>(`/contacts?page=${page}&page_size=${page_size}`, {
      method: 'GET',
    });
  },

  async syncContacts(contacts: Array<{ nom?: string; prenom?: string; numero: string }>) {
    return ApiClient.request<{ message: string }>('/contacts/sync', {
      method: 'POST',
      body: { contacts },
    });
  },
};

