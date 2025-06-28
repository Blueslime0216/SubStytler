import { SubtitleBlock } from '../../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore } from '../historyStore';
import { useSelectedSubtitleStore } from '../selectedSubtitleStore';

// Helper function to format time for history descriptions
function formatTimeForHistory(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const projectSubtitleActions: StateCreator<any> = (set, get, _store) => ({
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
});