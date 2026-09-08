// Hook personnalisé pour charger et modifier la liste des contacts
import { useState, useEffect, useCallback } from 'react';
import { contactsApi, Contact } from '../services/contacts.api';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactsApi.getContacts();
      if (res.success && res.data) {
        setContacts(res.data);
      } else {
        setError(res.message || 'Erreur lors du chargement des contacts');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (name: string, phone: string) => {
    setLoading(true);
    try {
      const res = await contactsApi.addContact({ name, phone });
      if (res.success && res.data) {
        setContacts((prev) => [res.data!, ...prev]);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (id: string) => {
    setLoading(true);
    try {
      const res = await contactsApi.deleteContact(id);
      if (res.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { contacts, loading, error, refresh: fetchContacts, addContact, removeContact };
}
