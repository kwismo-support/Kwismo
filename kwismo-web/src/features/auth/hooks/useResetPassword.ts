import { useState } from 'react';
import { authApi } from '../services/auth.api';
import type { ResetPasswordInput } from '../schemas/auth.schema';

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (data: ResetPasswordInput, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.resetPassword(data, token);
      setSuccess(true);
      return res;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPassword,
    loading,
    success,
    error,
  };
}
