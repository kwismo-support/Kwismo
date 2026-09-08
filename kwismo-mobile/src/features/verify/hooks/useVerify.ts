// Hook React pour effectuer la vérification de numéro et récupérer les résultats de risque
import { useState } from 'react';
import { verifyApi, VerifyResult } from '../services/verify.api';

export function useVerify() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const verifyPhone = async (phone: string) => {
    setLoading(true);
    try {
      const res = await verifyApi.checkNumber(phone);
      if (res.success && res.data) {
        setResult(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { verifyPhone, result, loading };
}
