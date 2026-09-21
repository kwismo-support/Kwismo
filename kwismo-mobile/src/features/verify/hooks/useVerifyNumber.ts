import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyApi, VerifyResult } from '../services/verify.api';

export function useVerifyNumber() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const verifyNumber = async (phone: string) => {
    if (!phone.trim()) {
      setError(t('validation.phoneRequired'));
      return { success: false };
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyApi.checkNumber(phone);
      if (res.success && res.data) {
        setResult(res.data);
        return { success: true, data: res.data };
      } else {
        const msg = t('errors.generalMessage');
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || t('toasts.networkError');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { verifyNumber, result, loading, error };
}
