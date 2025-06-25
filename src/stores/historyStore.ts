import { create } from 'zustand';
import { Area } from '../types/area';
import { useLayoutStore } from './layoutStore';

/*
 * Lightweight undo/redo implementation inspired by zustand's
 * (yet-to-be-released in this project) temporal middleware.
 * We keep three stacks – past, present, future – and expose helpers
 * that mirror the temporal API surface expected by the rest of the code.
 */

interface HistoryState {
  pastStates: Area[][];
  present: Area[];
  futureStates: Area[][];
  record: (areas: Area[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  pastStates: [],
  present: [],
  futureStates: [],

  record: (areas: Area[]) => {
    const { present } = get();
    // Avoid recording identical snapshots to cut down noise.
    if (present === areas) return;

    set((state) => {
      if (state.present.length === 0) {
        // 첫 기록 – 과거 스택을 쌓지 않고 현재 상태만 설정
        return {
          present: areas,
        };
      }
      return {
        pastStates: [...state.pastStates, state.present],
        present: areas,
        futureStates: [], // clear future on new change
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.pastStates.length === 0) return state;
      const previous = state.pastStates[state.pastStates.length - 1];
      const newPast = state.pastStates.slice(0, -1);
      const newFuture = [state.present, ...state.futureStates];

      // Reflect the change in the live layout store.
      useLayoutStore.getState().setAreas(previous);

      return {
        pastStates: newPast,
        present: previous,
        futureStates: newFuture,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.futureStates.length === 0) return state;
      const next = state.futureStates[0];
      const newFuture = state.futureStates.slice(1);
      const newPast = [...state.pastStates, state.present];

      // Apply to layout store
      useLayoutStore.getState().setAreas(next);

      return {
        pastStates: newPast,
        present: next,
        futureStates: newFuture,
      };
    });
  }
})); 