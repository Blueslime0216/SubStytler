import { create } from 'zustand';
import { Project, SubtitleBlock, SubtitleStyle, VideoMeta, SubtitleTrack } from '../types/project';
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
  addStyle: (style: SubtitleStyle) => void;
  updateStyle: (id: string, updates: Partial<SubtitleStyle>) => void;
  deleteStyle: (id: string) => void;
  
  // Track management
  addTrack: (name: string) => string | null;
  updateTrack: (id: string, updates: Partial<SubtitleTrack>) => void;
  deleteTrack: (id: string) => void;
  
  // Video upload trigger
  triggerVideoUpload: () => void;
  
  // Project update
  updateProject: (updates: Partial<Project>) => void;
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