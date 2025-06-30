import { create } from 'zustand';
import { Project, SubtitleBlock, VideoMeta, SubtitleTrack } from '../types/project';
import { createProjectActions } from './projectActions';

interface ProjectState {
  currentProject: Project | null;
  isModified: boolean;
  triggerUploadCounter: number;
  
  // Actions injected from slice
  createProject: (name: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => void;
  setVideoMeta: (meta: VideoMeta) => void;
  addSubtitle: (subtitle: SubtitleBlock) => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>, recordHistory?: boolean) => void;
  deleteSubtitle: (id: string) => void;
  
  // Track management
  addTrack: (name: string) => string | null;
  updateTrack: (id: string, updates: Partial<SubtitleTrack>) => void;
  deleteTrack: (id: string) => void;
  
  // Video upload trigger
  triggerVideoUpload: () => void;
  
  // Project update
  updateProject: (updates: Partial<Project>) => void;

  // Keyframe actions
  addKeyframe: (subtitleId: string, property: string, keyframe: { time: number; value: any; easingId?: string }) => void;
  moveKeyframe: (subtitleId: string, property: string, oldTime: number, newTime: number) => void;
  setKeyframeEasing: (subtitleId: string, property: string, time: number, easingId: string) => void;
  deleteKeyframe: (subtitleId: string, property: string, time: number) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  isModified: false,
  triggerUploadCounter: 0,

  triggerVideoUpload: () => {
    set((state) => ({
      triggerUploadCounter: state.triggerUploadCounter + 1
    }));
  },
  
  updateProject: (updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    set({
      currentProject: {
        ...currentProject,
        ...updates,
        updatedAt: Date.now()
      },
      isModified: true
    });
  },

  ...createProjectActions(set, get, {} as any),
}));