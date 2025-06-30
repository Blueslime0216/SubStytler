import { create } from 'zustand';
import { ParsedYTT, parseYTT } from '../utils/yttParser';

interface YTTState {
  rawYtt: string | null;
  parsed: ParsedYTT | null;
  loadYTT: (yttXml: string) => void;
}

export const useYTTStore = create<YTTState>((set) => ({
  rawYtt: null,
  parsed: null,
  loadYTT: (yttXml) => {
    try {
      const parsed = parseYTT(yttXml);
      set({ rawYtt: yttXml, parsed });
    } catch (err) {
      console.error('[YTTStore] Failed to parse YTT:', err);
    }
  },
})); 