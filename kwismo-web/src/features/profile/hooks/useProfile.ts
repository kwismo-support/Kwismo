import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi } from '../services/profile.api';
import type { UserProfileMe, ProfileUpdateIn } from '../services/profile.api';
import { toast } from '@/shared/store/toastStore';
import { useAuthStore } from '@/shared/store/authStore';

export function useProfile() {
  const { t, i18n } = useTranslation('admin');
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profileApi.getMe();
      setProfile(data);
      if (data.langue && data.langue !== i18n.language) {
        i18n.changeLanguage(data.langue);
      }
    } catch {
      toast.error(t('profile.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [i18n, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (payload: ProfileUpdateIn) => {
    setUpdating(true);
    try {
      const updated = await profileApi.updateMe(payload);
      setProfile(updated);
      if (payload.langue) {
        i18n.changeLanguage(payload.langue);
      }
      if (authUser) {
        setAuthUser({
          ...authUser,
          nom: updated.nom,
          prenom: updated.prenom,
          langue: (updated.langue as 'fr' | 'en') || 'fr',
        });
      }
      toast.success(t('profile.toasts.updateSuccess'));
      return true;
    } catch {
      toast.error(t('profile.toasts.updateError'));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    updateProfile,
  };
}
