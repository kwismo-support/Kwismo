import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/lib/axios';
import { AUTH_USER_KEY } from '@/config/constants';
import { env } from '@/config/env';
import { MOCK_USERS } from '@/shared/mock/mockUsers';
import type { User } from '@/shared/types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
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
      isLoading: false,

      setUser: (user) => set({ user }),

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
            role: typeof data.role === 'string' ? data.role : data.role?.nomRole || 'admin',
            langue: data.langue || 'fr',
            isBanned: data.statut === 'suspended',
            createdAt: data.date_inscription || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            partnerId: data.partner_id || data.partnerId,
          };
          set({ user: userObj, isLoading: false });
        } catch (err) {
          localStorage.removeItem('kwismo_auth_token');
          localStorage.removeItem('kwismo_user');
          set({ user: null, isLoading: false });
          throw new Error('Session invalide');
        }
      },

      logout: async () => {
        try {
          if (!env.useMock) {
            await apiClient.post('/auth/logout');
          }
        } catch {}
        localStorage.removeItem('kwismo_auth_token');
        localStorage.removeItem('kwismo_user');
        set({ user: null });
      },
    }),
    {
      name: AUTH_USER_KEY,
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
