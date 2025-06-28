import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore } from './historyStore';
import { useSelectedTrackStore } from './selectedTrackStore';

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
    
    // Record initial state for undo/redo
    useHistoryStore.getState().record(
      { tracks: project.tracks, selectedTrackId: project.tracks[0]?.id || null },
      'Project created'
    );
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
      
      // Record initial state for undo/redo
      useHistoryStore.getState().record(
        { tracks: newProject.tracks, selectedTrackId: newProject.tracks[0]?.id || null },
        'Project created'
      );
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
      // Suppress selection history during this action
      const historyStore = useHistoryStore.getState();
      const selectedTrackStore = useSelectedTrackStore.getState();
      (historyStore as any)._suppressSelectionHistory = true;

      const newTrack = {
        id: crypto.randomUUID(),
        name,
        language: 'en',
        visible: true,
        locked: false,
      };

      // 실제 트랙 추가
      set({
        currentProject: {
          ...currentProject,
          tracks: [...currentProject.tracks, newTrack],
        },
        isModified: true,
      });

      // 선택 트랙도 새 트랙으로 변경
      selectedTrackStore.setSelectedTrackId(newTrack.id);

      // 히스토리에는 트랙+선택 상태를 한 번만 기록
      historyStore.record(
        { tracks: [...currentProject.tracks, newTrack], selectedTrackId: newTrack.id },
        `Added track "${name}"`
      );

      (historyStore as any)._suppressSelectionHistory = false;
      return newTrack.id;
    }
    return null;
  },

  updateTrack: (id: string, updates: Partial<any>) => {
    const { currentProject } = get();
    if (currentProject) {
      const updatedTracks = currentProject.tracks.map((track: any) => 
        track.id === id ? { ...track, ...updates } : track);

      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
        },
        isModified: true,
      });

      const { selectedTrackId } = useSelectedTrackStore.getState();
      // Record state BEFORE mutation for undo baseline
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before update track'
      );

      let desc = 'Updated track';
      if (updates.name) desc = `Renamed track to "${updates.name}"`;
      if (updates.visible !== undefined) desc = `${updates.visible ? 'Showed' : 'Hid'} track`;
      if (updates.locked !== undefined) desc = `${updates.locked ? 'Locked' : 'Unlocked'} track`;

      useHistoryStore.getState().record(
        { tracks: updatedTracks, selectedTrackId },
        desc
      );
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

      const { selectedTrackId } = useSelectedTrackStore.getState();
      // Record state BEFORE mutation for undo baseline
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before delete track'
      );

      useHistoryStore.getState().record(
        { tracks: updatedTracks, selectedTrackId },
        'Deleted track'
      );
    }
  },
}); 