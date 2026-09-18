import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi, UserMeResponse, UserUpdatePayload } from '../services/profile.api';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';

export function useProfile() {
  const [profile, setProfile] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        useAuthStore.getState().setUser({
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.prenom,
          lastName: res.data.nom,
          role: res.data.role,
          langue: res.data.langue,
          kpi: res.data.kpi,
        });
      } else {
        setError(res.message || t('profile.fetchError'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (payload: UserUpdatePayload) => {
    setLoading(true);
    try {
      const res = await profileApi.updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        useAuthStore.getState().setUser({
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.prenom,
          lastName: res.data.nom,
          role: res.data.role,
          langue: res.data.langue,
          kpi: res.data.kpi,
        });
        toast.success(t('toasts.generalSuccess'));
      } else if (!res.success) {
        toast.error(res.message || t('profile.updateError'));
      }
      return res;
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await profileApi.logout();
    } catch {}
    await useAuthStore.getState().logout();
  };

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    updateProfile,
    logout: handleLogout,
  };
}
