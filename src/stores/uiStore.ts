
import { create } from 'zustand';

interface UIState {
  isMobileMode: boolean;
  toggleMobileMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMode: false,
  toggleMobileMode: () => set((state) => ({ isMobileMode: !state.isMobileMode })),
}));
