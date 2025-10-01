import { create } from 'zustand';

interface SelectedSubtitleState {
  selectedSubtitleId: string | null;
  setSelectedSubtitleId: (id: string | null) => void;
  selectedKeyframe: { property: string; time: number } | null;
  setSelectedKeyframe: (keyframe: { property: string; time: number } | null) => void;
}

export const useSelectedSubtitleStore = create<SelectedSubtitleState>((set) => ({
  selectedSubtitleId: null,
  setSelectedSubtitleId: (id) => set({ selectedSubtitleId: id }),
  selectedKeyframe: null,
  setSelectedKeyframe: (keyframe) => set({ selectedKeyframe: keyframe }),
})); 