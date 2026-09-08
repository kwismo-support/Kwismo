// Hook personnalisé React pour gérer la logique de connexion
import { useState } from 'react';
import { authApi } from '../services/auth.api';
import { LoginPayload } from '../schemas/auth.schema';
import { useAuthStore } from '../../../shared/store/authStore';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        login(res.data.user, res.data.token);
        return { success: true, data: res.data };
      } else {
        setError(res.message || 'Erreur de connexion');
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      const msg = err.message || 'Erreur inconnue lors de la connexion';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}
