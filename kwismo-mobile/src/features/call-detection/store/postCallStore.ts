import { create } from 'zustand';

interface PostCallState {
  visible: boolean;
  phoneNumber: string;
  showPostCallPrompt: (phone: string) => void;
  hidePostCallPrompt: () => void;
}

export const usePostCallStore = create<PostCallState>((set) => ({
  visible: false,
  phoneNumber: '',
  showPostCallPrompt: (phone: string) => {
    if (!phone) return;
    set({ visible: true, phoneNumber: phone });
  },
  hidePostCallPrompt: () => {
    set({ visible: false, phoneNumber: '' });
  },
}));
