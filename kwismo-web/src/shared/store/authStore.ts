import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/shared/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
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

        set({ isLoading: true });
        try {
          const user = await api.get<User>(ENDPOINTS.users.me);
          set({ user, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
          throw new Error('Session invalide');
        }
      },

      logout: async () => {
        if (!env.useMock) {
          try {
            await api.post(ENDPOINTS.auth.logout);
          } catch {}
        }
        set({ user: null });
      },
    }),
    {
      name: AUTH_USER_KEY,
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
