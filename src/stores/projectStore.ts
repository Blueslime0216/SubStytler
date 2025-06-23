import { create } from 'zustand';
import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';
import { createProjectActions } from './projectActions';

interface ProjectState {
  currentProject: Project | null;
  isModified: boolean;
  
  // Actions injected from slice
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

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  isModified: false,

  ...createProjectActions(set, get, {} as any),
}));