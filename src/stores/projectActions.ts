import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';
import { StateCreator } from 'zustand';

export const createProjectActions: StateCreator<any> = (set, get, _store) => ({
  createProject: (name: string) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      tracks: [
        {
          id: 'default',
          name: 'Default Track',
          language: 'en',
          visible: true,
          locked: false,
        },
      ],
      subtitles: [],
      styles: [],
      timeline: {
        currentTime: 0,
        zoom: 1,
        viewStart: 0,
        viewEnd: 10,
      },
      dependencies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentProject: project, isModified: false });
  },

  loadProject: (project: Project) => {
    set({ currentProject: project, isModified: false });
  },

  saveProject: () => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: { ...currentProject, updatedAt: Date.now() },
        isModified: false,
      });
    }
  },

  setVideoMeta: (meta: VideoMeta) => {
    const { currentProject } = get();
    
    if (currentProject) {
      set({ currentProject: { ...currentProject, videoMeta: meta }, isModified: true });
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: 'Untitled',
        tracks: [
          {
            id: 'default',
            name: 'Default Track',
            language: 'en',
            visible: true,
            locked: false,
          },
        ],
        subtitles: [],
        styles: [],
        timeline: {
          currentTime: 0,
          zoom: 1,
          viewStart: 0,
          viewEnd: 10,
        },
        dependencies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        videoMeta: meta,
      };
      set({ currentProject: newProject, isModified: true });
    }
  },

  addSubtitle: (subtitle: SubtitleBlock) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: { ...currentProject, subtitles: [...currentProject.subtitles, subtitle] },
        isModified: true,
      });
    }
  },

  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          subtitles: currentProject.subtitles.map((sub: SubtitleBlock) =>
            sub.id === id ? { ...sub, ...updates } : sub,
          ),
        },
        isModified: true,
      });
    }
  },

  deleteSubtitle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          subtitles: currentProject.subtitles.filter((sub: SubtitleBlock) => sub.id !== id),
        },
        isModified: true,
      });
    }
  },

  addStyle: (style: SubtitleStyle) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: [...currentProject.styles, style],
        },
        isModified: true,
      });
    }
  },

  updateStyle: (id: string, updates: Partial<SubtitleStyle>) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: currentProject.styles.map((s: SubtitleStyle) => (s.id === id ? { ...s, ...updates } : s)),
        },
        isModified: true,
      });
    }
  },

  deleteStyle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          styles: currentProject.styles.filter((s: SubtitleStyle) => s.id !== id),
        },
        isModified: true,
      });
    }
  },

  // Track management actions
  addTrack: (name: string) => {
    const { currentProject } = get();
    if (currentProject) {
      const newTrack = {
        id: crypto.randomUUID(),
        name,
        language: 'en',
        visible: true,
        locked: false,
      };
      
      set({
        currentProject: {
          ...currentProject,
          tracks: [...currentProject.tracks, newTrack],
        },
        isModified: true,
      });
      
      return newTrack.id;
    }
    
    return null;
  },

  updateTrack: (id: string, updates: Partial<any>) => {
    const { currentProject } = get();
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          tracks: currentProject.tracks.map((track: any) => 
            track.id === id ? { ...track, ...updates } : track
          ),
        },
        isModified: true,
      });
    }
  },

  deleteTrack: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      // Delete the track
      let updatedTracks = currentProject.tracks.filter((track: any) => track.id !== id);

      // Ensure at least one track remains
      if (updatedTracks.length === 0) {
        updatedTracks = [{
          id: 'default',
          name: 'Default Track',
          language: 'en',
          visible: true,
          locked: false,
        }];
      }
      
      // Also delete all subtitles in this track
      const updatedSubtitles = currentProject.subtitles.filter(
        (subtitle: SubtitleBlock) => subtitle.trackId !== id
      );
      
      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });
    }
  },
}); 