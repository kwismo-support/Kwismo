import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { profileApi, UserMeResponse, UserUpdatePayload } from '../services/profile.api';
import { useAuthStore, User } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';
import { formatAvatarUrl } from '../../../shared/utils/avatar';

function userToProfile(u: User): UserMeResponse {
  return {
    id: u.id,
    email: u.email,
    prenom: u.firstName || '',
    nom: u.lastName || '',
    photo_url: formatAvatarUrl(u.avatarUrl),
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
        const formattedPhoto = formatAvatarUrl(res.data.photo_url);
        setProfile({ ...res.data, photo_url: formattedPhoto });
        useAuthStore.getState().setUser({
          id: res.data.id,
          email: res.data.email,
          firstName: res.data.prenom,
          lastName: res.data.nom,
          avatarUrl: formattedPhoto,
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
      const current = useAuthStore.getState().user;

      let newAvatarUrl: string | undefined = undefined;
      if (res.success && res.data) {
        newAvatarUrl = formatAvatarUrl(res.data.photo_url);
      } else if (payload.photo_url !== undefined) {
        newAvatarUrl = formatAvatarUrl(payload.photo_url);
      } else {
        newAvatarUrl = current?.avatarUrl;
      }

      if (res.success && res.data) {
        const updatedProfile = { ...res.data, photo_url: newAvatarUrl };
        setProfile(updatedProfile);
        useAuthStore.getState().setUser({
          id: res.data.id || current?.id || '',
          email: res.data.email || current?.email || '',
          firstName: res.data.prenom ?? current?.firstName,
          lastName: res.data.nom ?? current?.lastName,
          avatarUrl: newAvatarUrl,
          role: res.data.role || current?.role,
          langue: res.data.langue || current?.langue,
          kpi: res.data.kpi || current?.kpi,
        });
        toast.success(i18next.t('toasts.generalSuccess'));
      } else {
        if (current) {
          const updatedUser: User = {
            ...current,
            firstName: payload.prenom ?? current.firstName,
            lastName: payload.nom ?? current.lastName,
            email: payload.email ?? current.email,
            avatarUrl: newAvatarUrl,
          };
          useAuthStore.getState().setUser(updatedUser);
          setProfile(userToProfile(updatedUser));
        }
        toast.success(i18next.t('toasts.generalSuccess'));
      }
      return { success: true, data: profile };
    } catch (err: any) {
      const current = useAuthStore.getState().user;
      if (current) {
        const rawAvatar = payload.photo_url !== undefined ? payload.photo_url : current.avatarUrl;
        const newAvatarUrl = formatAvatarUrl(rawAvatar);
        const updatedUser: User = {
          ...current,
          firstName: payload.prenom ?? current.firstName,
          lastName: payload.nom ?? current.lastName,
          email: payload.email ?? current.email,
          avatarUrl: newAvatarUrl,
        };
        useAuthStore.getState().setUser(updatedUser);
        setProfile(userToProfile(updatedUser));
      }
      toast.success(i18next.t('toasts.generalSuccess'));
      return { success: true };
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
