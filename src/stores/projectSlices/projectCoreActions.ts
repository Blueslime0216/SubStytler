import { Project, VideoMeta } from '../../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore } from '../historyStore';
import { useSelectedTrackStore } from '../selectedTrackStore';

export const projectCoreActions: StateCreator<any> = (set, get, _store) => ({
  createProject: (name: string) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      tracks: [
        {
          id: 'default',
          name: 'Default Track',
          detail: '',
          visible: true,
          locked: false,
        },
      ],
      subtitles: [],
      styles: [
        {
          id: 'default',
          name: 'Default',
          fc: '#FFFFFF',
          fo: 1,
          bc: '#000000',
          bo: 0.5,
          fs: '0',
          sz: '100%',
          ju: 3,
          ap: 4,
          pd: '00',
          et: 0,
          ec: '#000000'
        }
      ],
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
    
    // 🔧 Record initial state immediately after project creation
    // This ensures there's always a baseline state to undo to
    setTimeout(() => {
      useHistoryStore.getState().record(
        { tracks: project.tracks, selectedTrackId: project.tracks[0]?.id || null },
        'Project created with default track'
      );
    }, 0);
  },

  loadProject: (project: Project) => {
    // Ensure default style exists
    if (!project.styles.find(s => s.id === 'default')) {
      project.styles.push({
        id: 'default',
        name: 'Default',
        fc: '#FFFFFF',
        fo: 1,
        bc: '#000000',
        bo: 0.5,
        fs: '0',
        sz: '100%',
        ju: 3,
        ap: 4,
        pd: '00',
        et: 0,
        ec: '#000000'
      });
    }
    
    set({ currentProject: project, isModified: false });
    
    // 🔧 Record loaded project state as initial undo point
    setTimeout(() => {
      const { selectedTrackId } = useSelectedTrackStore.getState();
      useHistoryStore.getState().record(
        { tracks: project.tracks, selectedTrackId: selectedTrackId || project.tracks[0]?.id || null },
        'Project loaded'
      );
    }, 0);
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

  updateProject: (updates: Partial<Project>) => {
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

  setVideoMeta: (meta: VideoMeta) => {
    const { currentProject } = get();
    
    if (currentProject) {
      const updatedProject = { ...currentProject, videoMeta: meta };
      set({ currentProject: updatedProject, isModified: true });
      
      // 🔧 Record state after video is added
      setTimeout(() => {
        const { selectedTrackId } = useSelectedTrackStore.getState();
        useHistoryStore.getState().record(
          { tracks: updatedProject.tracks, selectedTrackId: selectedTrackId || updatedProject.tracks[0]?.id || null },
          'Video added to project'
        );
      }, 0);
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: 'Untitled',
        tracks: [
          {
            id: 'default',
            name: 'Default Track',
            detail: '',
            visible: true,
            locked: false,
          },
        ],
        subtitles: [],
        styles: [
          {
            id: 'default',
            name: 'Default',
            fc: '#FFFFFF',
            fo: 1,
            bc: '#000000',
            bo: 0.5,
            fs: '0',
            sz: '100%',
            ju: 3,
            ap: 4,
            pd: '00',
            et: 0,
            ec: '#000000'
          }
        ],
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
      
      // 🔧 Record initial state for new project created via video upload
      setTimeout(() => {
        useHistoryStore.getState().record(
          { tracks: newProject.tracks, selectedTrackId: newProject.tracks[0]?.id || null },
          'Project created with video and default track'
        );
      }, 0);
    }
  },
});