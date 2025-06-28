import { create } from 'zustand';
import { Area } from '../types/area';
import { useLayoutStore } from './layoutStore';
import { useProjectStore } from './projectStore';
import { useSelectedTrackStore } from './selectedTrackStore';
import { useSelectedSubtitleStore } from './selectedSubtitleStore';

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
  internal?: boolean; // if true, hidden from UI
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
  record: (snapshot: Snapshot, description?: string, internal?: boolean) => void;
  undo: () => void;
  redo: () => void;
  /** Jump directly to a specific entry (identified by timestamp). */
  jumpTo: (timestamp: number) => void;
  /** Sequential jump (undo/redo steps) */
  jumpToSequential: (timestamp: number) => Promise<void>;
  /** busy flag to lock interactions */
  isBusy: boolean;
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
  isBusy: false,

  record: (snapshot: Snapshot, description = 'State modified', internal = false) => {
    const { present } = get();

    // 🔧 Skip recording if snapshot is identical to current present
    if (present && JSON.stringify(present.snapshot) === JSON.stringify(snapshot)) {
      return;
    }

    const newEntry: HistoryEntry = { 
      snapshot, 
      description, 
      timestamp: Date.now(),
      internal 
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
      if (!currentState.present?.internal || currentState.pastStates.length === 0) {
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
      if (!currentState.present?.internal || currentState.futureStates.length === 0) {
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
    if (newPresent.internal) {
      // Try to find the next visible state in the future first
      const nextVisibleIndex = newFuture.findIndex(entry => !entry.internal);
      if (nextVisibleIndex !== -1) {
        // Jump forward to the next visible state
        const nextVisible = newFuture[nextVisibleIndex];
        const finalPast = [...newPast, newPresent, ...newFuture.slice(0, nextVisibleIndex)];
        const finalFuture = newFuture.slice(nextVisibleIndex + 1);
        
        applySnapshot(nextVisible.snapshot);
        set({ pastStates: finalPast, present: nextVisible, futureStates: finalFuture });
      } else {
        // No visible future state, try to find previous visible state
        const prevVisibleIndex = [...newPast].reverse().findIndex(entry => !entry.internal);
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

  jumpToSequential: async (timestamp: number) => {
    const { pastStates, present, futureStates, undo, redo } = useHistoryStore.getState();
    if (!present) return;
    const allEntries = [...pastStates, present, ...futureStates];
    const currentIndex = pastStates.length; // index of present in allEntries
    const targetIndex = allEntries.findIndex((e) => e.timestamp === timestamp);
    if (targetIndex === -1 || targetIndex === currentIndex) return;

    // lock
    useHistoryStore.setState({ isBusy: true });

    const step = targetIndex < currentIndex ? -1 : 1;
    const steps = Math.abs(targetIndex - currentIndex);

    for (let i = 0; i < steps; i++) {
      if (step === -1) undo(); else redo();
      // allow UI to update
      await new Promise((res) => requestAnimationFrame(() => res(null)));
    }

    useHistoryStore.setState({ isBusy: false });
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
    
    const filter = (arr: HistoryEntry[]) => arr.filter((e) => !e.internal);
    return {
      pastStates: filter(pastStates),
      present: present && !present.internal ? present : null,
      futureStates: filter(futureStates)
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

    // 🆕 Subtitle snapshot
    if (snapshot && snapshot.project && snapshot.project.subtitles) {
      const { currentProject } = useProjectStore.getState();
      if (currentProject) {
        useProjectStore.setState({
          currentProject: {
            ...currentProject,
            subtitles: snapshot.project.subtitles,
          },
        });
      }

      // Selection
      if (snapshot.project.selectedSubtitleId !== undefined) {
        useSelectedSubtitleStore.getState().setSelectedSubtitleId(snapshot.project.selectedSubtitleId);
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
  if (isSelectionSuppressed()) return;
  if (state.selectedTrackId !== prevSelectedTrackId) {
    prevSelectedTrackId = state.selectedTrackId;
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      const track = currentProject.tracks.find(t => t.id === state.selectedTrackId);
      const trackName = track?.name || 'Unknown';
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId: state.selectedTrackId },
        `Selected track: "${trackName}"`
      );
    }
  }
});

// 🆕 Subscribe to selected subtitle changes to record history (only when changed)
let prevSelectedSubtitleId: string | null = null;

useSelectedSubtitleStore.subscribe((state) => {
  if (isApplyingSnapshot) return;
  if (isSelectionSuppressed()) return;
  if (state.selectedSubtitleId !== prevSelectedSubtitleId) {
    prevSelectedSubtitleId = state.selectedSubtitleId;
    const { currentProject } = useProjectStore.getState();
    if (currentProject && state.selectedSubtitleId) {
      const subtitle = currentProject.subtitles.find(s => s.id === state.selectedSubtitleId);
      if (subtitle) {
        const subtitleText = subtitle.spans[0]?.text || 'Empty subtitle';
        const displayText = subtitleText.length > 20 
          ? subtitleText.substring(0, 20) + '...' 
          : subtitleText;
          
        useHistoryStore.getState().record(
          { 
            project: {
              subtitles: currentProject.subtitles,
              selectedSubtitleId: state.selectedSubtitleId
            }
          },
          `Selected subtitle: "${displayText}"`
        );
      }
    }
  }
});

// Variable to suppress selection history during composite actions
let selectionSuppressedFlag = false;
export const setSelectionSuppressed = (v: boolean) => { selectionSuppressedFlag = v; };
export const isSelectionSuppressed = () => selectionSuppressedFlag;