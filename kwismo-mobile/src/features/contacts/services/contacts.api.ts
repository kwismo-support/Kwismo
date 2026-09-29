import { ApiClient, ApiResponse } from '../../../shared/services/apiClient';
import { offlineQueue } from '../../../shared/services/offlineQueue';

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
    return ApiClient.request<ContactItem[]>('/contacts', {
      method: 'GET',
    });
  },

  async syncContacts(contacts: Array<{ nom: string; prenom?: string; numero: string }>) {
    return ApiClient.request<ContactItem[]>('/contacts/sync', {
      method: 'POST',
      body: { contacts },
      silent: true,
    });
  },

  async addContact(payload: { nom: string; numero: string }): Promise<ApiResponse<ContactItem>> {
    try {
      const res = await ApiClient.request<ContactItem>('/contacts', {
        method: 'POST',
        body: payload,
      });
      if (!res.success) {
        await offlineQueue.enqueue('phone_add', '/contacts', 'POST', payload);
      }
      return res;
    } catch {
      await offlineQueue.enqueue('phone_add', '/contacts', 'POST', payload);
      return {
        success: true,
        message: 'Contact enregistré hors-ligne',
        data: {
          id: `offline-${Date.now()}`,
          nom: payload.nom,
          numero_valeur: payload.numero,
        },
      };
    }
  },

  async removeContact(contactId: string) {
    return ApiClient.request<{ message: string }>(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },
};
