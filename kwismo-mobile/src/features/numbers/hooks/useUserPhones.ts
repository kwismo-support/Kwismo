// Hook React pour gérer les numéros rattachés au compte utilisateur
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { numbersApi, UserPhoneItem } from '../services/numbers.api';
import { toast } from '../../../shared/store/toastStore';

export function useUserPhones() {
  const [phones, setPhones] = useState<UserPhoneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await numbersApi.getMyNumbers();
      if (res.success && res.data) {
        setPhones(res.data);
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur de chargement des numéros.'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const addPhone = async (payload: { numero_valeur: string; country_id: string; operator_id: string }) => {
    setLoading(true);
    try {
      const res = await numbersApi.addNumber(payload);
      if (res.success) {
        toast.success(t('toasts.generalSuccess', 'Numéro ajouté avec succès !'));
        await fetchPhones();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const removePhone = async (phoneId: string) => {
    setLoading(true);
    try {
      const res = await numbersApi.deleteNumber(phoneId);
      if (res.success) {
        toast.success(t('toasts.generalSuccess', 'Numéro retiré.'));
        await fetchPhones();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    phones,
    loading,
    error,
    refresh: fetchPhones,
    addPhone,
    removePhone,
  };
}
