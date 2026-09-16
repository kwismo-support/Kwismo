import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/lib/axios';
import { AUTH_USER_KEY } from '@/config/constants';
import type { SupportedLang } from '@/config/constants';
import { env } from '@/config/env';
import { MOCK_USERS } from '@/shared/mock/mockUsers';
import { useLanguageStore } from '@/shared/store/languageStore';
import { clearAuthTokens } from '@/shared/lib/token';
import type { User } from '@/shared/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (token: string | null, refreshToken: string | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultMockUser: User = {
  id: MOCK_USERS[0].id,
  nom: MOCK_USERS[0].nom,
  prenom: MOCK_USERS[0].prenom,
  email: MOCK_USERS[0].email,
  role: 'admin',
  langue: 'fr',
  isBanned: false,
  createdAt: MOCK_USERS[0].dateInscription,
  updatedAt: MOCK_USERS[0].dateInscription,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: env.useMock ? defaultMockUser : null,
      token: env.useMock ? 'mock-jwt-token-kwismo-2026' : null,
      refreshToken: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      fetchMe: async () => {
        if (env.useMock) {
          const currentUser = get().user;
          set({ user: currentUser || defaultMockUser, isLoading: false });
          return;
        }

        const token = localStorage.getItem('kwismo_auth_token');
        if (!token) {
          set({ user: null, isLoading: false });
          throw new Error('Session expiré / Non connecté');
        }

        set({ isLoading: true });
        try {
          const res = await apiClient.get('/users/me');
          const data = res.data;
          const userObj: User = {
            id: data.id,
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email,
            role: typeof data.role === 'string' ? data.role : data.role?.nomRole || 'user',
            langue: data.langue || 'fr',
            isBanned: data.statut === 'suspended',
            createdAt: data.date_inscription || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            partnerId: data.partner_id || data.partnerId,
          };

          // Synchronisation des préférences de langue depuis le backend si présentes
          if (userObj.langue) {
            useLanguageStore.getState().setLang(userObj.langue as SupportedLang);
          }

          set({ user: userObj, isLoading: false });
        } catch (err) {
          clearAuthTokens();
          set({ user: null, isLoading: false });
          throw new Error('Session invalide');
        }
      },

      logout: async () => {
        try {
          if (!env.useMock) {
            const refreshToken = localStorage.getItem('kwismo_refresh_token');
            if (refreshToken) {
              await apiClient.post('/auth/logout', { refresh_token: refreshToken });
            }
          }
        } catch {}
        clearAuthTokens();
        set({ user: null });
      },
    }),
    {
      name: AUTH_USER_KEY,
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
    },
  ),
);

