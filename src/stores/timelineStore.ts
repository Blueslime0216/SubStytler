import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  fps: number;
  zoom: number;
  viewStart: number;
  viewEnd: number;
  frameDuration: number;
  
  // Dragging state for real-time sync
  isDragging: boolean;
  draggedSubtitleId: string | null;
  
  // Actions
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setDuration: (duration: number) => void;
  setFPS: (fps: number) => void;
  setZoom: (zoom: number) => void;
  setViewRange: (start: number, end: number) => void;
  seekToFrame: (frame: number) => void;
  getCurrentFrame: () => number;
  snapToFrame: (time: number) => number;
  
  // Dragging actions
  setDragging: (isDragging: boolean, subtitleId?: string) => void;
}

export const useTimelineStore = create<TimelineState>()(
  subscribeWithSelector((set, get) => ({
    currentTime: 0,
    isPlaying: false,
    duration: 60000,
    fps: 30,
    zoom: 1,
    viewStart: 0,
    viewEnd: 60000,
    frameDuration: 1000 / 30,
    
    // Dragging state
    isDragging: false,
    draggedSubtitleId: null,

    setCurrentTime: (time: number) => {
      const { snapToFrame } = get();
      set({ currentTime: snapToFrame(time) });
    },

    setPlaying: (playing: boolean) => set({ isPlaying: playing }),

    setDuration: (duration: number) => {
      set({
        duration,
        zoom: 1,
        viewStart: 0,
        viewEnd: duration,
      });
    },

    setFPS: (fps: number) => set({ 
      fps,
      frameDuration: 1000 / fps
    }),

    setZoom: (zoom: number) => set({ zoom: Math.max(1, Math.min(10, zoom)) }),

    setViewRange: (start: number, end: number) => set({ 
      viewStart: Math.max(0, start),
      viewEnd: Math.min(get().duration, end)
    }),

    seekToFrame: (frame: number) => {
      const { fps } = get();
      const time = (frame * 1000) / fps;
      set({ currentTime: time });
    },

    getCurrentFrame: () => {
      const { currentTime, fps } = get();
      return Math.round((currentTime * fps) / 1000);
    },

    snapToFrame: (time: number) => {
      const { fps } = get();
      const frame = Math.round((time * fps) / 1000);
      return (frame * 1000) / fps;
    },
    
    setDragging: (isDragging: boolean, subtitleId?: string) => {
      set({ 
        isDragging, 
        draggedSubtitleId: isDragging ? subtitleId || null : null 
      });
    }
  }))
);