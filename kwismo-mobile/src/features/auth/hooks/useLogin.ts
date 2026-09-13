// Hook personnalisé React pour gérer la connexion avec le backend FastAPI
import { useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/auth.api';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { t } = useTranslation();

  const getDeviceInfo = () => {
    const deviceId =
      Constants.deviceId ||
      Constants.installationId ||
      `dev-${Platform.OS}-${Date.now().toString(36)}`;
    const deviceName = `${Platform.OS.toUpperCase()} Mobile App`;
    return { deviceId, deviceName };
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { deviceId, deviceName } = getDeviceInfo();
      const res = await authApi.login({
        email: email.trim(),
        mot_de_passe: password,
        device_id: deviceId,
        device_name: deviceName,
      });

      if (res.success && res.data) {
        const data: any = res.data;
        if (data.requires_device_verification) {
          toast.error(t('auth.secureAccountOtpSubtitle', 'Nouvel appareil : vérification requise.'));
          return { success: false, requiresDeviceVerification: true };
        }

        if (data.access_token && data.user) {
          const userPayload = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.prenom || data.user.email.split('@')[0],
            lastName: data.user.nom || '',
            role: data.user.role || 'user',
          };

          await login(userPayload, data.access_token, data.refresh_token);
          toast.success(t('toasts.loginSuccess', 'Connexion réussie !'));
          return { success: true };
        }
      }

      const msg = res.message || t('errors.generalMessage', 'Connexion échouée.');
      setError(msg);
      return { success: false, message: msg };
    } catch (err: any) {
      const msg = err.message || t('toasts.networkError', 'Connexion réseau impossible.');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}

