import { create } from 'zustand';
import { SubtitleBlock } from '../types/project';

interface KeyframeClipboard {
  property: string;
  time: number;
  value: any;
  easingId?: string;
}

interface ClipboardState {
  copiedSubtitle: SubtitleBlock | null;
  setCopiedSubtitle: (subtitle: SubtitleBlock | null) => void;
  copiedKeyframe: KeyframeClipboard | null;
  setCopiedKeyframe: (keyframe: KeyframeClipboard | null) => void;
}

// 자막 및 키프레임 복사/붙여넣기용 클립보드 스토어
export const useClipboardStore = create<ClipboardState>((set) => ({
  copiedSubtitle: null,
  setCopiedSubtitle: (subtitle) => set({ copiedSubtitle: subtitle }),
  copiedKeyframe: null,
  setCopiedKeyframe: (keyframe) => set({ copiedKeyframe: keyframe }),
})); 