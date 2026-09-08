// Hook React pour récupérer et mettre à jour le profil utilisateur
import { useState, useEffect, useCallback } from 'react';
import { profileApi, UserProfile } from '../services/profile.api';
import { useAuthStore } from '../../../shared/store/authStore';

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, token } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        setProfileState(res.data);
        if (token) {
          login(res.data, token);
        }
      } else {
        setError(res.message || 'Erreur de chargement du profil');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [login, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const res = await profileApi.updateProfile(updates);
      if (res.success && res.data) {
        setProfileState(res.data);
        if (token) {
          login(res.data, token);
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword?: string, newPassword?: string) => {
    setLoading(true);
    try {
      return await profileApi.updatePassword({ currentPassword, newPassword });
    } finally {
      setLoading(false);
    }
  };

  const updatePin = async (currentPin?: string, newPin: string = '') => {
    setLoading(true);
    try {
      return await profileApi.updatePin({ currentPin, newPin });
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
    updatePassword,
    updatePin,
  };
}
