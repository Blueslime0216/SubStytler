import { create } from 'zustand';
import { Area } from '../types/area';
import { useLayoutStore } from './layoutStore';
import { useProjectStore } from './projectStore';
import { useSelectedTrackStore } from './selectedTrackStore';

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

type Snapshot = any;

interface HistoryEntry {
  snapshot: Snapshot;
  description: string;
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
  record: (snapshot: Snapshot, description?: string) => void;
  undo: () => void;
  redo: () => void;
  /** Jump directly to a specific entry (identified by timestamp). */
  jumpTo: (timestamp: number) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  pastStates: [],
  present: null,
  futureStates: [],

  record: (snapshot: Snapshot, description = 'State modified') => {
    const { present } = get();

    if (present && present.snapshot === snapshot) return;

    const newEntry: HistoryEntry = { snapshot, description, timestamp: Date.now() };

    set((state) => {
      // Always create pastStates entry for proper undo functionality
      return {
        pastStates: state.present ? [...state.pastStates, state.present] : [],
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
      applySnapshot(previous.snapshot);

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
      applySnapshot(next.snapshot);

      return {
        pastStates: newPast,
        present: next,
        futureStates: newFuture,
      };
    });
  },

  jumpTo: (timestamp: number) => {
    const { pastStates, present, futureStates } = get();
    if (!present) return;

    // Build full list for search
    const allEntries = [...pastStates, present, ...futureStates];
    const targetIndex = allEntries.findIndex((e) => e.timestamp === timestamp);
    if (targetIndex === -1) return; // Not found

    const newPast = allEntries.slice(0, targetIndex);
    const newPresent = allEntries[targetIndex];
    const newFuture = allEntries.slice(targetIndex + 1);

    applySnapshot(newPresent.snapshot);

    set({ pastStates: newPast, present: newPresent, futureStates: newFuture });
  },
}));

// Flag to suppress recording during internal snapshot application
let isApplyingSnapshot = false;

/**
 * Apply a snapshot to the relevant store(s)
 */
function applySnapshot(snapshot: Snapshot) {
  isApplyingSnapshot = true;
  // Layout areas snapshot (array of areas)
  if (Array.isArray(snapshot) && snapshot.length && 'x' in snapshot[0] && 'y' in snapshot[0]) {
    useLayoutStore.getState().setAreas(snapshot as Area[]);
    isApplyingSnapshot = false;
    return;
  }

  // Track snapshot
  if (snapshot && Array.isArray(snapshot.tracks)) {
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useProjectStore.setState({
        currentProject: {
          ...currentProject,
          tracks: snapshot.tracks,
        },
      });
    }

    // Selection
    if (snapshot.selectedTrackId !== undefined) {
      useSelectedTrackStore.getState().setSelectedTrackId(snapshot.selectedTrackId);
    }
    isApplyingSnapshot = false;
    return;
  }
  isApplyingSnapshot = false;
}

// ---------------------------------------------------------------------------
// Subscribe to selected track changes to record history (only when changed)
// ---------------------------------------------------------------------------
let prevSelectedTrackId: string | null = null;

useSelectedTrackStore.subscribe((state) => {
  if (isApplyingSnapshot) return;
  const historyStore = useHistoryStore.getState() as any;
  if (historyStore._suppressSelectionHistory) return;
  if (state.selectedTrackId !== prevSelectedTrackId) {
    prevSelectedTrackId = state.selectedTrackId;
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId: state.selectedTrackId },
        'Selected track changed'
      );
    }
  }
}); 