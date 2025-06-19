import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTimelineStore } from '../stores/timelineStore';
import { useProjectStore } from '../stores/projectStore';

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

  // Play/Pause
  useHotkeys('space', (e) => {
    e.preventDefault();
    setPlaying(!isPlaying);
  }, [isPlaying]);

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
};