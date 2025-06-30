import { create } from 'zustand';
import { SubtitleBlock } from '../types/project';

interface ClipboardState {
  copiedSubtitle: SubtitleBlock | null;
  setCopiedSubtitle: (subtitle: SubtitleBlock | null) => void;
}

// 자막 복사/붙여넣기용 클립보드 스토어
export const useClipboardStore = create<ClipboardState>((set) => ({
  copiedSubtitle: null,
  setCopiedSubtitle: (subtitle) => set({ copiedSubtitle: subtitle }),
})); 