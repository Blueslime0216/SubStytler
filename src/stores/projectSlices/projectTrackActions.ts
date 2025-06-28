import { StateCreator } from 'zustand';
import { useHistoryStore, setSelectionSuppressed } from '../historyStore';
import { useSelectedTrackStore } from '../selectedTrackStore';
import { useSelectedSubtitleStore } from '../selectedSubtitleStore';
import { SubtitleBlock, SubtitleTrack } from '../../types/project';

export const projectTrackActions: StateCreator<any> = (set, get, _store) => ({
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

  updateTrack: (id: string, updates: Partial<SubtitleTrack>) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the track to update
      const trackToUpdate = currentProject.tracks.find(track => track.id === id);
      if (!trackToUpdate) return;

      // 🔧 Record state BEFORE updating track (marked as internal)
      const { selectedTrackId } = useSelectedTrackStore.getState();
      useHistoryStore.getState().record(
        { tracks: currentProject.tracks, selectedTrackId },
        'Before updating track',
        true // 🆕 Mark as internal
      );

      const updatedTracks = currentProject.tracks.map((track: SubtitleTrack) => 
        track.id === id ? { ...track, ...updates } : track);

      set({
        currentProject: {
          ...currentProject,
          tracks: updatedTracks,
        },
        isModified: true,
      });

      // Generate appropriate description based on what was updated
      let desc = 'Updated track';
      if (updates.name !== undefined) {
        desc = `Renamed track to "${updates.name}"`;
      } else if (updates.visible !== undefined) {
        desc = `${updates.visible ? 'Showed' : 'Hid'} track "${trackToUpdate.name}"`;
      } else if (updates.locked !== undefined) {
        desc = `${updates.locked ? 'Locked' : 'Unlocked'} track "${trackToUpdate.name}"`;
      } else if (updates.detail !== undefined) {
        desc = `Updated track "${trackToUpdate.name}" detail`;
      }

      // 🔧 Record state AFTER updating track (visible in UI)
      useHistoryStore.getState().record(
        { tracks: updatedTracks, selectedTrackId },
        desc,
        false // 🆕 Not internal - this will be visible in history panel
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
      const trackToDelete = currentProject.tracks.find((track: SubtitleTrack) => track.id === id);
      const trackName = trackToDelete?.name || 'Unknown Track';

      // Delete the track
      let updatedTracks = currentProject.tracks.filter((track: SubtitleTrack) => track.id !== id);
      
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