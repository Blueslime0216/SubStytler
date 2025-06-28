import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore, setSelectionSuppressed, isSelectionSuppressed } from './historyStore';
import { useSelectedTrackStore } from './selectedTrackStore';
import { useSelectedSubtitleStore } from './selectedSubtitleStore';

export const createProjectActions: StateCreator<any> = (set, get, _store) => ({
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

  addSubtitle: (subtitle: SubtitleBlock) => {
    const { currentProject } = get();
    if (currentProject) {
      // 🆕 Record state BEFORE adding subtitle
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId: useSelectedSubtitleStore.getState().selectedSubtitleId
          }
        },
        'Before adding subtitle',
        true // Mark as internal
      );

      // Ensure the subtitle has a styleId (default if not specified)
      const updatedSubtitle = {
        ...subtitle,
        spans: subtitle.spans.map(span => ({
          ...span,
          styleId: span.styleId || 'default'
        }))
      };
      
      // Add the subtitle
      const updatedSubtitles = [...currentProject.subtitles, updatedSubtitle];
      set({
        currentProject: { 
          ...currentProject, 
          subtitles: updatedSubtitles 
        },
        isModified: true,
      });

      // 🆕 Record state AFTER adding subtitle
      historyStore.record(
        { 
          project: {
            subtitles: updatedSubtitles,
            selectedSubtitleId: updatedSubtitle.id
          }
        },
        `Added subtitle at ${formatTimeForHistory(updatedSubtitle.startTime)}`
      );
    }
  },

  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the subtitle to update
      const subtitleToUpdate = currentProject.subtitles.find(sub => sub.id === id);
      if (!subtitleToUpdate) return;

      // 🆕 Record state BEFORE updating subtitle
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId: useSelectedSubtitleStore.getState().selectedSubtitleId
          }
        },
        'Before updating subtitle',
        true // Mark as internal
      );

      // Create updated subtitles array
      const updatedSubtitles = currentProject.subtitles.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      );

      // Update the project
      set({
        currentProject: {
          ...currentProject,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });

      // Generate appropriate description based on what was updated
      let description = 'Updated subtitle';
      if (updates.spans && subtitleToUpdate.spans[0]?.text !== updates.spans[0]?.text) {
        description = 'Edited subtitle text';
      } else if (updates.startTime !== undefined || updates.endTime !== undefined) {
        if (updates.trackId !== undefined && updates.trackId !== subtitleToUpdate.trackId) {
          description = 'Moved subtitle to different track';
        } else {
          description = 'Adjusted subtitle timing';
        }
      }

      // 🆕 Record state AFTER updating subtitle
      historyStore.record(
        { 
          project: {
            subtitles: updatedSubtitles,
            selectedSubtitleId: useSelectedSubtitleStore.getState().selectedSubtitleId
          }
        },
        description
      );
    }
  },

  deleteSubtitle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the subtitle to delete
      const subtitleToDelete = currentProject.subtitles.find(sub => sub.id === id);
      if (!subtitleToDelete) return;

      // 🆕 Record state BEFORE deleting subtitle
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId: useSelectedSubtitleStore.getState().selectedSubtitleId
          }
        },
        'Before deleting subtitle',
        true // Mark as internal
      );

      // Create updated subtitles array
      const updatedSubtitles = currentProject.subtitles.filter(sub => sub.id !== id);

      // Update the project
      set({
        currentProject: {
          ...currentProject,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });

      // 🆕 Record state AFTER deleting subtitle
      historyStore.record(
        { 
          project: {
            subtitles: updatedSubtitles,
            selectedSubtitleId: null
          }
        },
        `Deleted subtitle at ${formatTimeForHistory(subtitleToDelete.startTime)}`
      );

      // Clear selected subtitle if it was the one deleted
      if (useSelectedSubtitleStore.getState().selectedSubtitleId === id) {
        useSelectedSubtitleStore.getState().setSelectedSubtitleId(null);
      }
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
      // Update any subtitles using this style to use the default style
      const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
        const needsUpdate = sub.spans.some(span => span.styleId === id);
        if (!needsUpdate) return sub;
        
        return {
          ...sub,
          spans: sub.spans.map(span => 
            span.styleId === id ? { ...span, styleId: 'default' } : span
          )
        };
      });
      
      set({
        currentProject: {
          ...currentProject,
          styles: currentProject.styles.filter((s: SubtitleStyle) => s.id !== id),
          subtitles: updatedSubtitles
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
      setSelectionSuppressed(true);

      const newTrack = {
        id: crypto.randomUUID(),
        name,
        detail: '',
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
      useSelectedTrackStore.getState().setSelectedTrackId(newTrack.id);

      // 🔧 Record state AFTER adding track (visible in UI)
      useHistoryStore.getState().record(
        { tracks: updatedTracks, selectedTrackId: newTrack.id },
        `Added track "${name}"`,
        false // 🆕 Not internal - this will be visible in history panel
      );

      setSelectionSuppressed(false);
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
      if (updates.detail !== undefined) desc = `Updated track detail`;

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
      setSelectionSuppressed(true);

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

      setSelectionSuppressed(false);
    }
  },
});

// Helper function to format time for history descriptions
function formatTimeForHistory(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}