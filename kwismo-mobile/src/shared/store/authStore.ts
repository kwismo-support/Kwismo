import { create } from 'zustand';
import { env } from '../config/env';
import { storage } from '../services/storage';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  langue?: string;
  kpi?: {
    numeros_verifies?: number;
    signalements_effectues?: number;
    transferts_proteges?: number;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

const USER_STORAGE_KEY = 'kwismo_user_session';
const REFRESH_TOKEN_KEY = 'kwismo_refresh_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  token: null,
  refreshToken: null,

  initializeAuth: async () => {
    try {
      const savedToken = await storage.getItem(env.AUTH_TOKEN_KEY);
      const savedUserStr = await storage.getItem(USER_STORAGE_KEY);
      const savedRefreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        set({
          isAuthenticated: true,
          isInitialized: true,
          token: savedToken,
          refreshToken: savedRefreshToken,
          user: parsedUser,
        });
      } else {
        set({
          isAuthenticated: false,
          isInitialized: true,
          token: null,
          refreshToken: null,
          user: null,
        });
      }
    } catch {
      set({
        isAuthenticated: false,
        isInitialized: true,
        token: null,
        refreshToken: null,
        user: null,
      });
    }
  },

  login: async (user: User, token: string, refreshToken?: string) => {
    await storage.setItem(env.AUTH_TOKEN_KEY, token);
    await storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (refreshToken) {
      await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({
      isAuthenticated: true,
      token,
      refreshToken: refreshToken || null,
      user,
    });
  },

  logout: async () => {
    await storage.removeItem(env.AUTH_TOKEN_KEY);
    await storage.removeItem(USER_STORAGE_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    set({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
    });
  },

  setUser: (user: User) => {
    set({ user });
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user)).catch(() => {});
  },
}));

