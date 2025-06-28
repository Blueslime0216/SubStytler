import { create } from 'zustand';

interface SelectedTrackState {
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
}

export const useSelectedTrackStore = create<SelectedTrackState>((set) => ({
  selectedTrackId: null,
  setSelectedTrackId: (id) => set({ selectedTrackId: id }),
})); 