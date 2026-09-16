import { useState } from 'react';
import { authApi, type LoginResult } from '../services/auth.api';
import type { LoginInput } from '../schemas/auth.schema';
import { useAuthStore } from '@/shared/store/authStore';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceVerifyData, setDeviceVerifyData] = useState<{ email: string; deviceId: string } | null>(null);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const login = async (data: LoginInput): Promise<LoginResult | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(data);
      if (res.requiresDeviceVerification && res.email && res.deviceId) {
        setDeviceVerifyData({ email: res.email, deviceId: res.deviceId });
        return res;
      }
      await fetchMe();
      return res;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyDevice = async (code: string) => {
    if (!deviceVerifyData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyDevice(deviceVerifyData.email, code, deviceVerifyData.deviceId);
      await fetchMe();
      setDeviceVerifyData(null);
      return res;
    } catch (err: any) {
      setError(err.message || 'Code de vérification invalide');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    verifyDevice,
    loading,
    error,
    deviceVerifyData,
    clearDeviceVerify: () => setDeviceVerifyData(null),
  };
}
