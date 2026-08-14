import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/shared/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import { AUTH_USER_KEY } from '@/config/constants';
import type { User } from '@/shared/types/user';

interface AuthState {
  user:      User | null;
  isLoading: boolean;
  setUser:   (user: User | null) => void;
  fetchMe:   () => Promise<void>;
  logout:    () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:      null,
      isLoading: false,

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await api.get<User>(ENDPOINTS.auth.me);
          set({ user, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
          throw new Error('Session invalide');
        }
      },

      logout: async () => {
        try {
          await api.post(ENDPOINTS.auth.logout);
        } finally {
          set({ user: null });
        }
      },
    }),
    {
      name:    AUTH_USER_KEY,
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
