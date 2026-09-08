// Service API backend pour la gestion des contacts
import { ApiClient } from '../../../shared/services/apiClient';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  isRegistered: boolean;
  avatarUrl?: string;
  status?: 'active' | 'compromised' | 'unknown';
}

export const contactsApi = {
  async getContacts() {
    return ApiClient.request<Contact[]>('/contacts', {
      method: 'GET',
      mockDataFallback: [
        { id: '1', name: 'Paul Biya', phone: '+237690001122', isRegistered: true, status: 'active' },
        { id: '2', name: 'Samuel Etoo', phone: '+237677889900', isRegistered: true, status: 'compromised' },
        { id: '3', name: 'Marie Jeanne', phone: '+237655443322', isRegistered: false, status: 'unknown' },
      ],
    });
  },

  async addContact(payload: { name: string; phone: string }) {
    return ApiClient.request<Contact>('/contacts', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        id: Date.now().toString(),
        name: payload.name,
        phone: payload.phone,
        isRegistered: true,
        status: 'active',
      },
    });
  },

  async deleteContact(id: string) {
    return ApiClient.request<{ message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
      mockDataFallback: { message: 'Contact supprimé avec succès' },
    });
  },
};
