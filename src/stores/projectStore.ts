import { create } from 'zustand';
import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';

interface ProjectState {
  currentProject: Project | null;
  isModified: boolean;
  
  // Actions
  createProject: (name: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => void;
  setVideoMeta: (meta: VideoMeta) => void;
  addSubtitle: (subtitle: SubtitleBlock) => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>) => void;
  deleteSubtitle: (id: string) => void;
  addStyle: (style: SubtitleStyle) => void;
  updateStyle: (id: string, updates: Partial<SubtitleStyle>) => void;
  deleteStyle: (id: string) => void;
}

const createDefaultProject = (name: string): Project => ({
  id: crypto.randomUUID(),
  name,
  tracks: [
    {
      id: 'default',
      name: 'Default Track',
      language: 'en',
      visible: true,
      locked: false
    }
  ],
  subtitles: [],
  styles: [
    {
      id: 'default',
      name: 'Default Style',
      fc: '#FFFFFF',
      fo: 1,
      bc: '#000000',
      bo: 0.8,
      fs: 'sans-serif',
      sz: '100%',
      ju: 2,
      ap: 6
    }
  ],
  timeline: {
    currentTime: 0,
    zoom: 1,
    viewStart: 0,
    viewEnd: 10
  },
  dependencies: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  isModified: false,

  createProject: (name: string) => {
    const project = createDefaultProject(name);
    set({ currentProject: project, isModified: false });
  },

  loadProject: (project: Project) => {
    set({ currentProject: project, isModified: false });
  },

  saveProject: () => {
    const { currentProject } = get();
    if (currentProject) {
      // Auto-save to IndexedDB would happen here
      set({ 
        currentProject: { 
          ...currentProject, 
          updatedAt: Date.now() 
        },
        isModified: false 
      });
    }
  },

  setVideoMeta: (meta: VideoMeta) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: { ...currentProject, videoMeta: meta },
        isModified: true
      });
    }
  },

  addSubtitle: (subtitle: SubtitleBlock) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          subtitles: [...currentProject.subtitles, subtitle]
        },
        isModified: true
      });
    }
  },

  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          subtitles: currentProject.subtitles.map(sub =>
            sub.id === id ? { ...sub, ...updates } : sub
          )
        },
        isModified: true
      });
    }
  },

  deleteSubtitle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          subtitles: currentProject.subtitles.filter(sub => sub.id !== id)
        },
        isModified: true
      });
    }
  },

  addStyle: (style: SubtitleStyle) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: [...currentProject.styles, style]
        },
        isModified: true
      });
    }
  },

  updateStyle: (id: string, updates: Partial<SubtitleStyle>) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: currentProject.styles.map(style =>
            style.id === id ? { ...style, ...updates } : style
          )
        },
        isModified: true
      });
    }
  },

  deleteStyle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: currentProject.styles.filter(style => style.id !== id)
        },
        isModified: true
      });
    }
  }
}));