import { create } from 'zustand';

interface SnapState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
}

export const useSnapStore = create<SnapState>((set) => ({
  enabled: true,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setEnabled: (v) => set({ enabled: v }),
})); 