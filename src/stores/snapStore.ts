import { create } from 'zustand';
import { useHistoryStore } from './historyStore';

interface SnapState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean, record?: boolean) => void;
}

export const useSnapStore = create<SnapState>((set, get) => ({
  enabled: true,

  // 스냅 토글: 상태 반전 후 히스토리 기록
  toggle: () => {
    const newEnabled = !get().enabled;
    get().setEnabled(newEnabled, true);
  },

  // 상태 설정. record 플래그가 true 이면 히스토리에 기록
  setEnabled: (v, record = false) => {
    set({ enabled: v });

    if (record) {
      useHistoryStore.getState().record(
        { snapEnabled: v },
        v ? 'Enable snapping' : 'Disable snapping'
      );
    }
  },
})); 