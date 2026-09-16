import { useState } from 'react';
import { authApi } from '../services/auth.api';
import type { ForgotPasswordInput } from '../schemas/auth.schema';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(data);
      setSent(true);
      return res;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestReset,
    loading,
    sent,
    error,
  };
}
