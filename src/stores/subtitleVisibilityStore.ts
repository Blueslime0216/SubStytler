import { create } from 'zustand';

interface SubtitleVisibilityState {
  isSubtitleVisible: boolean;
  toggleSubtitleVisibility: () => void;
  setSubtitleVisibility: (visible: boolean) => void;
}

export const useSubtitleVisibilityStore = create<SubtitleVisibilityState>((set) => ({
  isSubtitleVisible: true, // 기본적으로 자막이 켜져 있음
  toggleSubtitleVisibility: () => set((state) => ({ isSubtitleVisible: !state.isSubtitleVisible })),
  setSubtitleVisibility: (visible: boolean) => set({ isSubtitleVisible: visible }),
}));
