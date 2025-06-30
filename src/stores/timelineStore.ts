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
  
  // New function to calculate max zoom based on duration and container width
  getMaxZoom: (containerWidth?: number) => number;
}

export const useTimelineStore = create<TimelineState>()(
  subscribeWithSelector((set, get) => ({
    currentTime: 0,
    isPlaying: false,
    duration: 60000, // Default to 60 seconds even without video
    fps: 30,
    zoom: 1,
    viewStart: 0,
    viewEnd: 60000, // Default to 60 seconds even without video
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
      // Use a minimum duration of 60 seconds if no video is loaded
      const effectiveDuration = duration > 0 ? duration : 60000;
      set({
        duration: effectiveDuration,
        zoom: 1,
        viewStart: 0,
        viewEnd: effectiveDuration,
      });
    },

    setFPS: (fps: number) => set({ 
      fps,
      frameDuration: 1000 / fps
    }),

    setZoom: (zoom: number) => {
      const { getMaxZoom } = get();
      const maxZoom = getMaxZoom();
      set({ zoom: Math.max(1, Math.min(maxZoom, zoom)) });
    },

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
    },
    
    // Calculate maximum zoom based on duration and container width
    // Target: 1ms = 10px at maximum zoom
    getMaxZoom: (containerWidth = window.innerWidth) => {
      const { duration } = get();
      if (duration <= 0) return 100; // Fallback to 100 if no duration
      
      // At zoom level 1, the entire duration is visible
      // At max zoom, 1ms should be 10px wide
      
      // Calculate pixels per ms at zoom level 1
      const pixelsPerMsAtZoom1 = containerWidth / duration;
      
      // Calculate zoom needed to make 1ms = 10px
      const maxZoom = 10 / pixelsPerMsAtZoom1;
      
      // Ensure reasonable limits
      return Math.max(100, Math.min(10000, Math.ceil(maxZoom)));
    }
  }))
);