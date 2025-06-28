import { create } from 'zustand';
import { Area } from '../types/area';
import { useLayoutStore } from './layoutStore';

/*
 * Lightweight undo/redo implementation inspired by zustand's
 * (yet-to-be-released in this project) temporal middleware.
 * We keep three stacks – past, present, future – and expose helpers
 * that mirror the temporal API surface expected by the rest of the code.
 */

// ---------------------------------------------------------------------------
// Enhanced history store
// We now keep additional metadata (description & timestamp) so the History
// panel can show a meaningful list of actions. The previous API surface is
// preserved so existing calls do not break.
// ---------------------------------------------------------------------------

interface HistoryEntry {
  /** Snapshot of the layout areas at this point in time */
  snapshot: Area[];
  /** Human-readable description of the action */
  description: string;
  /** Epoch milliseconds of when the action was recorded */
  timestamp: number;
}

interface HistoryState {
  pastStates: HistoryEntry[];
  present: HistoryEntry | null;
  futureStates: HistoryEntry[];
  /**
   * Record a new history entry. A description can be supplied to show in the
   * History panel; if omitted, a generic one will be used so existing code
   * continues to work without modification.
   */
  record: (areas: Area[], description?: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  pastStates: [],
  present: null,
  futureStates: [],

  record: (areas: Area[], description = 'Layout modified') => {
    const { present } = get();

    // Avoid recording identical snapshots (reference equality).
    if (present && present.snapshot === areas) return;

    const newEntry: HistoryEntry = {
      snapshot: areas,
      description,
      timestamp: Date.now(),
    };

    set((state) => {
      if (!state.present) {
        // 첫 기록 – 과거 스택을 쌓지 않고 현재 상태만 설정
        return {
          present: newEntry,
        };
      }

      return {
        pastStates: [...state.pastStates, state.present],
        present: newEntry,
        futureStates: [], // 새로운 변경이 일어나면 redo 스택은 초기화됩니다.
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.pastStates.length === 0 || !state.present) return state;

      const previous = state.pastStates[state.pastStates.length - 1];
      const newPast = state.pastStates.slice(0, -1);
      const newFuture = [state.present, ...state.futureStates];

      // Reflect the change in the live layout store.
      useLayoutStore.getState().setAreas(previous.snapshot);

      return {
        pastStates: newPast,
        present: previous,
        futureStates: newFuture,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.futureStates.length === 0 || !state.present) return state;

      const next = state.futureStates[0];
      const newFuture = state.futureStates.slice(1);
      const newPast = [...state.pastStates, state.present];

      // Apply to layout store
      useLayoutStore.getState().setAreas(next.snapshot);

      return {
        pastStates: newPast,
        present: next,
        futureStates: newFuture,
      };
    });
  },
})); 