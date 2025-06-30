import { create } from 'zustand';

interface SnapHighlightState {
  snapIds: Set<string>;
  setSnapIds: (ids: string[]) => void;
  clear: () => void;
}

export const useSnapHighlightStore = create<SnapHighlightState>((set) => ({
  snapIds: new Set(),
  setSnapIds: (ids) => set({ snapIds: new Set(ids) }),
  clear: () => set({ snapIds: new Set() }),
})); 