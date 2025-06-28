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
  isInternal?: boolean; // 🆕 Flag to mark internal "Before" entries
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
  record: (snapshot: Snapshot, description?: string, isInternal?: boolean) => void;
  undo: () => void;
  redo: () => void;
  /** Jump directly to a specific entry (identified by timestamp). */
  jumpTo: (timestamp: number) => void;
  /** Clear all history - useful for new projects */
  clear: () => void;
  /** Get user-visible history entries (excludes internal "Before" entries) */
  getVisibleHistory: () => {
    pastStates: HistoryEntry[];
    present: HistoryEntry | null;
    futureStates: HistoryEntry[];
  };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  pastStates: [],
  present: null,
  futureStates: [],

  record: (snapshot: Snapshot, description = 'State modified', isInternal = false) => {
    const { present } = get();

    // 🔧 Skip recording if snapshot is identical to current present
    if (present && JSON.stringify(present.snapshot) === JSON.stringify(snapshot)) {
      return;
    }

    const newEntry: HistoryEntry = { 
      snapshot, 
      description, 
      timestamp: Date.now(),
      isInternal 
    };

    set((state) => {
      return {
        pastStates: state.present ? [...state.pastStates, state.present] : [],
        present: newEntry,
        futureStates: [], // 새로운 변경이 일어나면 redo 스택은 초기화됩니다.
      };
    });
  },

  undo: () => {
    const performUndo = () => {
      const state = get();
      if (state.pastStates.length === 0 || !state.present) return false;

      const previous = state.pastStates[state.pastStates.length - 1];
      const newPast = state.pastStates.slice(0, -1);
      const newFuture = [state.present, ...state.futureStates];

      // Reflect the change in the live layout store.
      applySnapshot(previous.snapshot);

      set({
        pastStates: newPast,
        present: previous,
        futureStates: newFuture,
      });

      return true;
    };

    // 🆕 Perform initial undo
    if (!performUndo()) return;

    // 🆕 Continue undoing while current state is internal (hidden)
    // This ensures we always land on a user-visible state
    let attempts = 0;
    const maxAttempts = 10; // Safety limit to prevent infinite loops
    
    while (attempts < maxAttempts) {
      const currentState = get();
      
      // If current state is visible or we've reached the beginning, stop
      if (!currentState.present?.isInternal || currentState.pastStates.length === 0) {
        break;
      }
      
      // Continue undoing if current state is internal
      if (!performUndo()) break;
      attempts++;
    }
  },

  redo: () => {
    const performRedo = () => {
      const state = get();
      if (state.futureStates.length === 0 || !state.present) return false;

      const next = state.futureStates[0];
      const newFuture = state.futureStates.slice(1);
      const newPast = [...state.pastStates, state.present];

      // Apply to layout store
      applySnapshot(next.snapshot);

      set({
        pastStates: newPast,
        present: next,
        futureStates: newFuture,
      });

      return true;
    };

    // 🆕 Perform initial redo
    if (!performRedo()) return;

    // 🆕 Continue redoing while current state is internal (hidden)
    // This ensures we always land on a user-visible state
    let attempts = 0;
    const maxAttempts = 10; // Safety limit to prevent infinite loops
    
    while (attempts < maxAttempts) {
      const currentState = get();
      
      // If current state is visible or we've reached the end, stop
      if (!currentState.present?.isInternal || currentState.futureStates.length === 0) {
        break;
      }
      
      // Continue redoing if current state is internal
      if (!performRedo()) break;
      attempts++;
    }
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

    // 🆕 If we jumped to an internal state, auto-navigate to nearest visible state
    if (newPresent.isInternal) {
      // Try to find the next visible state in the future first
      const nextVisibleIndex = newFuture.findIndex(entry => !entry.isInternal);
      if (nextVisibleIndex !== -1) {
        // Jump forward to the next visible state
        const nextVisible = newFuture[nextVisibleIndex];
        const finalPast = [...newPast, newPresent, ...newFuture.slice(0, nextVisibleIndex)];
        const finalFuture = newFuture.slice(nextVisibleIndex + 1);
        
        applySnapshot(nextVisible.snapshot);
        set({ pastStates: finalPast, present: nextVisible, futureStates: finalFuture });
      } else {
        // No visible future state, try to find previous visible state
        const prevVisibleIndex = [...newPast].reverse().findIndex(entry => !entry.isInternal);
        if (prevVisibleIndex !== -1) {
          const actualIndex = newPast.length - 1 - prevVisibleIndex;
          const prevVisible = newPast[actualIndex];
          const finalPast = newPast.slice(0, actualIndex);
          const finalFuture = [...newPast.slice(actualIndex + 1), newPresent, ...newFuture];
          
          applySnapshot(prevVisible.snapshot);
          set({ pastStates: finalPast, present: prevVisible, futureStates: finalFuture });
        }
      }
    }
  },

  clear: () => {
    set({
      pastStates: [],
      present: null,
      futureStates: [],
    });
  },

  // 🆕 Get filtered history for UI display (excludes internal "Before" entries)
  getVisibleHistory: () => {
    const { pastStates, present, futureStates } = get();
    
    return {
      pastStates: pastStates.filter(entry => !entry.isInternal),
      present: present && !present.isInternal ? present : null,
      futureStates: futureStates.filter(entry => !entry.isInternal)
    };
  },
}));

// Flag to suppress recording during internal snapshot application
let isApplyingSnapshot = false;

/**
 * Apply a snapshot to the relevant store(s)
 */
function applySnapshot(snapshot: Snapshot) {
  isApplyingSnapshot = true;
  
  try {
    // Layout areas snapshot (array of areas)
    if (Array.isArray(snapshot) && snapshot.length && 'x' in snapshot[0] && 'y' in snapshot[0]) {
      useLayoutStore.getState().setAreas(snapshot as Area[]);
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
      return;
    }
  } finally {
    isApplyingSnapshot = false;
  }
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