// Hook React pour récupérer et synchroniser les contacts avec le backend Kwismo
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { contactsApi, ContactItem } from '../services/contacts.api';
import { toast } from '../../../shared/store/toastStore';

export function useContacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactsApi.getContacts();
      if (res.success && res.data) {
        setContacts(res.data.items || []);
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur de chargement des contacts.'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const syncDeviceContacts = async (rawContacts: Array<{ nom?: string; prenom?: string; numero: string }>) => {
    setLoading(true);
    try {
      const res = await contactsApi.syncContacts(rawContacts);
      if (res.success) {
        toast.success(t('toasts.generalSuccess', 'Contacts synchronisés.'));
        await fetchContacts();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    error,
    refresh: fetchContacts,
    syncDeviceContacts,
  };
}
