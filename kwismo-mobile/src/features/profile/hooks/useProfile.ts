import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { profileApi, UserMeResponse, UserUpdatePayload } from '../services/profile.api';
import { useAuthStore, User } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';

function userToProfile(u: User): UserMeResponse {
  return {
    id: u.id,
    email: u.email,
    prenom: u.firstName || '',
    nom: u.lastName || '',
    langue: u.langue || 'fr',
    role: u.role || 'user',
    email_verifie: true,
    statut: 'active',
    kpi: {
      numeros_verifies: u.kpi?.numeros_verifies ?? 0,
      signalements_effectues: u.kpi?.signalements_effectues ?? 0,
      transferts_proteges: u.kpi?.transferts_proteges ?? 0,
    },
  };
}

export function useProfile() {
  const cachedUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserMeResponse | null>(
    cachedUser ? userToProfile(cachedUser) : null
  );
  const [loading, setLoading] = useState<boolean>(!cachedUser);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser && !forceRefresh) {
      setProfile(userToProfile(currentUser));
      setLoading(false);
      return;
    }

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
        setError(res.message || i18next.t('profile.fetchError'));
      }
    } catch (err: any) {
      setError(err.message || i18next.t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(false);
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
        toast.success(i18next.t('toasts.generalSuccess'));
      } else if (!res.success) {
        toast.error(res.message || i18next.t('profile.updateError'));
      }
      return res;
    } catch (err: any) {
      toast.error(err.message || i18next.t('toasts.networkError'));
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
    refresh: () => fetchProfile(true),
    updateProfile,
    logout: handleLogout,
  };
}
