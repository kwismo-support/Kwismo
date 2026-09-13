// Hook React pour récupérer et mettre à jour le profil utilisateur via /users/me
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profileApi, UserMeResponse, UserUpdatePayload } from '../services/profile.api';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';

export function useProfile() {
  const [profile, setProfile] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  const { t } = useTranslation();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setUser({
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.prenom,
          lastName: res.data.nom,
          role: res.data.role,
          langue: res.data.langue,
          kpi: res.data.kpi,
        });
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur de profil.'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau.'));
    } finally {
      setLoading(false);
    }
  }, [setUser, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (payload: UserUpdatePayload) => {
    setLoading(true);
    try {
      const res = await profileApi.updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        setUser({
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.prenom,
          lastName: res.data.nom,
          role: res.data.role,
          langue: res.data.langue,
          kpi: res.data.kpi,
        });
        toast.success(t('toasts.generalSuccess', 'Modifications enregistrées.'));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    updateProfile,
  };
}

