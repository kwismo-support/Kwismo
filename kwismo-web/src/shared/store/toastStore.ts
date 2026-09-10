import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id:       string;
  type:     ToastType;
  title?:   string;
  message:  string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'success', message, title, duration });
  },
  error: (message: string, title?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'error', message, title, duration });
  },
  warning: (message: string, title?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'warning', message, title, duration });
  },
  info: (message: string, title?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: 'info', message, title, duration });
  },
};
