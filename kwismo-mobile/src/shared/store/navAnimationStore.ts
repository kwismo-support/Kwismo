import { create } from 'zustand';

export type StackAnimation = 'slide_from_right' | 'slide_from_left';

const TAB_INDEX_MAP: Record<string, number> = {
  home: 0,
  index: 0,
  management: 1,
  transfer: 2,
  profile: 3,
};

interface NavAnimationState {
  currentTabIndex: number;
  stackAnimation: StackAnimation;
  setTabNavigation: (targetTab: string) => StackAnimation;
  setSecondaryNavigation: () => void;
}

export const useNavAnimationStore = create<NavAnimationState>((set, get) => ({
  currentTabIndex: 0,
  stackAnimation: 'slide_from_right',
  setTabNavigation: (targetTab: string) => {
    const targetIndex = TAB_INDEX_MAP[targetTab] ?? 0;
    const currentIndex = get().currentTabIndex;
    const animation: StackAnimation = targetIndex >= currentIndex ? 'slide_from_right' : 'slide_from_left';
    set({
      currentTabIndex: targetIndex,
      stackAnimation: animation,
    });
    return animation;
  },
  setSecondaryNavigation: () => {
    set({ stackAnimation: 'slide_from_right' });
  },
}));
