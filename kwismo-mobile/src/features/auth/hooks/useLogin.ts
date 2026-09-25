import { useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/auth.api';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';
import { storage } from '../../../shared/services/storage';
import { getDeviceFingerprint } from '../../../shared/services/device';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { t, i18n } = useTranslation();

  const getDeviceInfo = async () => {
    const deviceId = await getDeviceFingerprint();
    const deviceName = `${Platform.OS.toUpperCase()} Mobile App`;
    return { deviceId, deviceName };
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const { deviceId, deviceName } = await getDeviceInfo();
      const res = await authApi.login({
        email: email.trim(),
        mot_de_passe: password,
        device_id: deviceId,
        device_name: deviceName,
      });

      if (res.success && res.data) {
        const data: any = res.data;
        if (data.requires_device_verification) {
          const isFr = i18n.language.startsWith('fr');
          const serverMessage = isFr ? data.message_fr : data.message_en;
          toast.error(serverMessage || t('auth.secureAccountOtpSubtitle'));
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

          await login(userPayload, data.access_token, data.refresh_token, rememberMe);
          toast.success(t('toasts.loginSuccess'));
          return { success: true };
        }
      }

      if (res.status === 403 || (res.message && res.message.toLowerCase().includes('email non v'))) {
        await storage.setItem('kwismo_pending_email', email.trim());
        toast.info(t('toasts.unverifiedEmailOtpSent'));
        return { success: false, requiresEmailVerification: true };
      }

      const msg = res.message || t('errors.generalMessage');
      setError(msg);
      return { success: false, message: msg };
    } catch (err: any) {
      const msg = err.message || t('toasts.networkError');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };


  return { handleLogin, loading, error };
}

