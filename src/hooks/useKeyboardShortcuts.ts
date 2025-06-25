// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Note: we do not currently use React hooks like useEffect here, but keeping react imported ensures hotkeys work in strict mode.
// (If linter complains, this comment silences it.)
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTimelineStore } from '../stores/timelineStore';
import { useProjectStore } from '../stores/projectStore';
import { useHistoryStore } from '../stores/historyStore';
import { useLayoutStore } from '../stores/layoutStore';

export const useKeyboardShortcuts = () => {
  const { 
    currentTime, 
    isPlaying, 
    setPlaying, 
    setCurrentTime, 
    fps,
    snapToFrame 
  } = useTimelineStore();
  
  const { saveProject } = useProjectStore();

  // History actions
  const { undo, redo } = useHistoryStore();

  // Layout actions
  const { focusedAreaId, coverArea } = useLayoutStore();

  // Play/Pause
  useHotkeys('space', (e) => {
    e.preventDefault();
    setPlaying(!isPlaying);
  }, [isPlaying]);

  // ──────────────────────────────────
  // Undo / Redo
  // Ctrl+Z / Cmd+Z
  useHotkeys('ctrl+z, meta+z', (e) => {
    e.preventDefault();
    undo();
  }, [undo]);

  // Ctrl+Y, Ctrl+Shift+Z, Alt+Z, or Cmd+Shift+Z (mac)
  useHotkeys('ctrl+y, ctrl+shift+z, alt+z, meta+shift+z', (e) => {
    e.preventDefault();
    redo();
  }, [redo]);

  // Save Project
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    saveProject();
  });

  // Frame Navigation
  useHotkeys('left', (e) => {
    e.preventDefault();
    const frameDuration = 1000 / fps;
    setCurrentTime(currentTime - frameDuration);
  }, [currentTime, fps]);

  useHotkeys('right', (e) => {
    e.preventDefault();
    const frameDuration = 1000 / fps;
    setCurrentTime(currentTime + frameDuration);
  }, [currentTime, fps]);

  // 10 Frame jumps
  useHotkeys('shift+left', (e) => {
    e.preventDefault();
    const frameDuration = (1000 / fps) * 10;
    setCurrentTime(currentTime - frameDuration);
  }, [currentTime, fps]);

  useHotkeys('shift+right', (e) => {
    e.preventDefault();
    const frameDuration = (1000 / fps) * 10;
    setCurrentTime(currentTime + frameDuration);
  }, [currentTime, fps]);

  // Go to start/end
  useHotkeys('home', (e) => {
    e.preventDefault();
    setCurrentTime(0);
  });

  useHotkeys('end', (e) => {
    e.preventDefault();
    const { duration } = useTimelineStore.getState();
    setCurrentTime(duration);
  });

  // 영역 덮기 단축키 (Ctrl+Alt+방향키)
  useHotkeys('ctrl+alt+up', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'top');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+down', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'bottom');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+left', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'left');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+right', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'right');
    }
  }, [focusedAreaId, coverArea]);
};