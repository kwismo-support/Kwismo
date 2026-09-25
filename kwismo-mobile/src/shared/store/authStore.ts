import { create } from 'zustand';
import i18next from 'i18next';
import { env } from '../config/env';
import { storage } from '../services/storage';
import { deleteUserPin } from '../lib/secureStore';

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
  rememberMe: boolean;
  login: (user: User, token: string, refreshToken?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

const USER_STORAGE_KEY = 'kwismo_user_session';
const REFRESH_TOKEN_KEY = 'kwismo_refresh_token';
const REMEMBER_ME_KEY = 'kwismo_remember_me';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  token: null,
  refreshToken: null,
  rememberMe: true,

  initializeAuth: async () => {
    try {
      const savedToken = await storage.getItem(env.AUTH_TOKEN_KEY);
      const savedUserStr = await storage.getItem(USER_STORAGE_KEY);
      const savedRefreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser.langue && (parsedUser.langue === 'fr' || parsedUser.langue === 'en')) {
          i18next.changeLanguage(parsedUser.langue).catch(() => {});
        }
        set({
          isAuthenticated: true,
          isInitialized: true,
          token: savedToken,
          refreshToken: savedRefreshToken,
          user: parsedUser,
          rememberMe: true,
        });
      } else {
        set({
          isAuthenticated: false,
          isInitialized: true,
          token: null,
          refreshToken: null,
          user: null,
          rememberMe: true,
        });
      }
    } catch {
      set({
        isAuthenticated: false,
        isInitialized: true,
        token: null,
        refreshToken: null,
        user: null,
        rememberMe: true,
      });
    }
  },

  login: async (user: User, token: string, refreshToken?: string, rememberMe: boolean = true) => {
    await storage.setItem(env.AUTH_TOKEN_KEY, token);
    await storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    await storage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
    if (refreshToken) {
      await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user.langue && (user.langue === 'fr' || user.langue === 'en')) {
      i18next.changeLanguage(user.langue).catch(() => {});
    }
    set({
      isAuthenticated: true,
      token,
      refreshToken: refreshToken || null,
      user,
      rememberMe,
    });
  },

  logout: async () => {
    await storage.removeItem(env.AUTH_TOKEN_KEY);
    await storage.removeItem(USER_STORAGE_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem(REMEMBER_ME_KEY);
    await deleteUserPin();
    set({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
      rememberMe: true,
    });
  },

  setUser: (user: User) => {
    set({ user });
    if (user.langue && (user.langue === 'fr' || user.langue === 'en')) {
      if (i18next.language !== user.langue) {
        i18next.changeLanguage(user.langue).catch(() => {});
      }
    }
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user)).catch(() => {});
  },
}));
