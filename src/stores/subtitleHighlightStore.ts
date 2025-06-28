import { create } from 'zustand';

interface HighlightState {
  highlightedIds: Set<string>;
  setHighlightedIds: (ids: string[]) => void;
  flashIds: (ids: string[], duration?: number) => void;
}

export const useSubtitleHighlightStore = create<HighlightState>((set) => ({
  highlightedIds: new Set(),
  setHighlightedIds: (ids: string[]) => set({ highlightedIds: new Set(ids) }),
  flashIds: (ids: string[], duration = 1000) => {
    const idSet = new Set(ids);
    set((state) => ({ highlightedIds: new Set([...state.highlightedIds, ...idSet]) }));

    setTimeout(() => {
      set((state) => {
        const newSet = new Set(state.highlightedIds);
        ids.forEach(id => newSet.delete(id));
        return { highlightedIds: newSet };
      });
    }, duration);
  },
})); 