import { create } from 'zustand';

interface SelectedSubtitleState {
  selectedSubtitleId: string | null;
  setSelectedSubtitleId: (id: string | null) => void;
}

export const useSelectedSubtitleStore = create<SelectedSubtitleState>((set) => ({
  selectedSubtitleId: null,
  setSelectedSubtitleId: (id) => set({ selectedSubtitleId: id }),
})); 