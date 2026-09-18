import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { securityApi, ChangePasswordPayload, TwoFactorInitResponse } from '../services/security.api';
import { toast } from '../../../shared/store/toastStore';

export function useSecurity() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const changePassword = async (payload: ChangePasswordPayload) => {
    setLoading(true);
    try {
      const res = await securityApi.changePassword(payload);
      if (res.success) {
        toast.success(t('toasts.passwordResetSuccess'));
      } else {
        toast.error(res.message || t('security.passwordUpdateError'));
      }
      return res;
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async (): Promise<TwoFactorInitResponse | null> => {
    setLoading(true);
    try {
      const res = await securityApi.enableTwoFactor();
      if (res.success && res.data) {
        return res.data;
      }
      toast.error(res.message || t('security.twoFactorEnableError'));
      return null;
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactor = async (code: string) => {
    setLoading(true);
    try {
      const res = await securityApi.verifyTwoFactor(code);
      if (res.success) {
        toast.success(t('security.twoFactorEnabled'));
      } else {
        toast.error(res.message || t('security.twoFactorVerifyError'));
      }
      return res.success;
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setLoading(true);
    try {
      const res = await securityApi.disableTwoFactor();
      if (res.success) {
        toast.info(t('security.twoFactorDisabled'));
      } else {
        toast.error(res.message || t('security.twoFactorDisableError'));
      }
      return res.success;
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    changePassword,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
  };
}
