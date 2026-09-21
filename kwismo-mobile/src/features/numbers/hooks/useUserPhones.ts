import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { numbersApi, UserPhoneItem } from '../services/numbers.api';
import { toast } from '../../../shared/store/toastStore';

export function useUserPhones() {
  const [phones, setPhones] = useState<UserPhoneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await numbersApi.getMyNumbers();
      if (res.success && res.data) {
        setPhones(res.data);
      } else {
        setError(res.message || i18next.t('errors.generalMessage'));
      }
    } catch (err: any) {
      setError(err.message || i18next.t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const addPhone = async (payload: { numero_valeur: string; country_id: string; operator_id: string }) => {
    setLoading(true);
    try {
      const res = await numbersApi.addNumber(payload);
      if (res.success) {
        toast.success(i18next.t('toasts.generalSuccess'));
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
        toast.success(i18next.t('toasts.generalSuccess'));
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
