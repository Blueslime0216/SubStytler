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
      
      // 🔧 Record initial state for new project created via video upload
      setTimeout(() => {
        useHistoryStore.getState().record(
          { tracks: newProject.tracks, selectedTrackId: newProject.tracks[0]?.id || null },
          'Project created with video and default track'
        );
      }, 0);
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
      // 🔧 Record state BEFORE adding track (marked as internal - hidden from UI)
      const { selectedTrackId } = useSelectedTrackStore.getState();
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before adding track',
        true // 🆕 Mark as internal - this will be hidden from history panel
      );

      // Suppress selection history during this action to avoid duplicate entries
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

      // Add the track to the project
      const updatedTracks = [...currentProject.tracks, newTrack];
      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
        },
        isModified: true,
      });

      // Update selected track
      selectedTrackStore.setSelectedTrackId(newTrack.id);

      // 🔧 Record state AFTER adding track (visible in UI)
      historyStore.record(
        { tracks: updatedTracks, selectedTrackId: newTrack.id },
        `Added track "${name}"`,
        false // 🆕 Not internal - this will be visible in history panel
      );

      (historyStore as any)._suppressSelectionHistory = false;
      return newTrack.id;
    }
    return null;
  },

  updateTrack: (id: string, updates: Partial<any>) => {
    const { currentProject } = get();
    if (currentProject) {
      // 🔧 Record state BEFORE updating track (marked as internal)
      const { selectedTrackId } = useSelectedTrackStore.getState();
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before updating track',
        true // 🆕 Mark as internal
      );

      const updatedTracks = currentProject.tracks.map((track: any) => 
        track.id === id ? { ...track, ...updates } : track);

      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
        },
        isModified: true,
      });

      let desc = 'Updated track';
      if (updates.name) desc = `Renamed track to "${updates.name}"`;
      if (updates.visible !== undefined) desc = `${updates.visible ? 'Showed' : 'Hid'} track`;
      if (updates.locked !== undefined) desc = `${updates.locked ? 'Locked' : 'Unlocked'} track`;

      // 🔧 Record state AFTER updating track (visible in UI)
      useHistoryStore.getState().record(
        { tracks: updatedTracks, selectedTrackId },
        desc,
        false // 🆕 Not internal
      );
    }
  },

  deleteTrack: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      // 🛡️ Prevent deletion of the last track
      if (currentProject.tracks.length <= 1) {
        console.warn('Cannot delete the last remaining track');
        return;
      }

      // 🔧 Record state BEFORE deleting track (marked as internal)
      const { selectedTrackId, setSelectedTrackId } = useSelectedTrackStore.getState();
      const historyStore = useHistoryStore.getState();
      
      historyStore.record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before deleting track',
        true // 🆕 Mark as internal - this will be hidden from history panel
      );

      // Suppress selection history during this action to avoid duplicate entries
      (historyStore as any)._suppressSelectionHistory = true;

      // Find the track being deleted
      const trackToDelete = currentProject.tracks.find((track: any) => track.id === id);
      const trackName = trackToDelete?.name || 'Unknown Track';

      // Delete the track
      let updatedTracks = currentProject.tracks.filter((track: any) => track.id !== id);
      
      // Also delete all subtitles in this track
      const updatedSubtitles = currentProject.subtitles.filter(
        (subtitle: SubtitleBlock) => subtitle.trackId !== id
      );

      // 🆕 Auto-select another track if the deleted track was selected
      let newSelectedTrackId = selectedTrackId;
      let selectionChangeDescription = '';
      
      if (selectedTrackId === id) {
        // Find the best replacement track
        const availableTracks = updatedTracks;
        
        if (availableTracks.length > 0) {
          // Prefer the first available track
          newSelectedTrackId = availableTracks[0].id;
          const newTrackName = availableTracks[0].name;
          selectionChangeDescription = ` and selected "${newTrackName}"`;
        } else {
          newSelectedTrackId = null;
        }
        
        // Update the selected track
        setSelectedTrackId(newSelectedTrackId);
      }
      
      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });

      // 🔧 Record state AFTER deleting track (visible in UI)
      const actionDescription = `Deleted track "${trackName}"${selectionChangeDescription}`;
      
      historyStore.record(
        { tracks: updatedTracks, selectedTrackId: newSelectedTrackId },
        actionDescription,
        false // 🆕 Not internal - this will be visible in history panel
      );

      (historyStore as any)._suppressSelectionHistory = false;
    }
  },
});