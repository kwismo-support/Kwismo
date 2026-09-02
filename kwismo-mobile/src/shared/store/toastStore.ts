import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // Duration in ms, default 3500ms
}

interface ToastState {
  toasts: ToastMessage[];
  show: (toast: Omit<ToastMessage, 'id'>) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      duration: toast.duration ?? 3500,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  success: (message, title, duration) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'success', message, title, duration: duration ?? 3500 }],
    }));
    return id;
  },

  error: (message, title, duration) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'error', message, title, duration: duration ?? 4000 }],
    }));
    return id;
  },

  info: (message, title, duration) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'info', message, title, duration: duration ?? 3500 }],
    }));
    return id;
  },

  warning: (message, title, duration) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type: 'warning', message, title, duration: duration ?? 3500 }],
    }));
    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper export for non-React contexts or quick access
export const toast = {
  success: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().success(message, title, duration),
  error: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().error(message, title, duration),
  info: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().info(message, title, duration),
  warning: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().warning(message, title, duration),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
