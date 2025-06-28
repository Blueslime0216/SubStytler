import { SubtitleStyle } from '../../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore } from '../historyStore';
import { useSelectedSubtitleStore } from '../selectedSubtitleStore';

export const projectStyleActions: StateCreator<any> = (set, get, _store) => ({
  addStyle: (style: SubtitleStyle) => {
    const { currentProject } = get();
    if (currentProject) {
      // Record state BEFORE adding style
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            styles: [...currentProject.styles],
            selectedStyleId: style.id
          }
        },
        'Before adding style',
        true // Mark as internal
      );
      
      // Add the style
      const updatedStyles = [...currentProject.styles, style];
      set({
        currentProject: {
          ...currentProject,
          styles: updatedStyles,
        },
        isModified: true,
      });
      
      // Record state AFTER adding style
      historyStore.record(
        { 
          project: {
            styles: updatedStyles,
            selectedStyleId: style.id
          }
        },
        `Added style "${style.name}"`
      );
    }
  },

  updateStyle: (id: string, updates: Partial<SubtitleStyle>) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the style to update
      const styleToUpdate = currentProject.styles.find(s => s.id === id);
      if (!styleToUpdate) return;
      
      // Record state BEFORE updating style
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            styles: [...currentProject.styles],
            selectedStyleId: id
          }
        },
        'Before updating style',
        true // Mark as internal
      );
      
      // Create updated styles array
      const updatedStyles = currentProject.styles.map(style =>
        style.id === id ? { ...style, ...updates } : style
      );
      
      // Update the project
      set({
        currentProject: {
          ...currentProject,
          styles: updatedStyles,
        },
        isModified: true,
      });
      
      // Generate appropriate description based on what was updated
      let description = 'Updated style properties';
      if (updates.name && styleToUpdate.name !== updates.name) {
        description = `Renamed style to "${updates.name}"`;
      } else if (updates.fc || updates.bc) {
        description = 'Changed style colors';
      } else if (updates.fs || updates.sz) {
        description = 'Changed style font properties';
      }
      
      // Record state AFTER updating style
      historyStore.record(
        { 
          project: {
            styles: updatedStyles,
            selectedStyleId: id
          }
        },
        description
      );
      
      // Update all subtitles using this style if needed
      // This is a complex operation that might need to be handled separately
      // depending on your application's requirements
    }
  },

  deleteStyle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      // Cannot delete default style
      if (id === 'default') return;
      
      // Find the style to delete
      const styleToDelete = currentProject.styles.find(s => s.id === id);
      if (!styleToDelete) return;
      
      // Record state BEFORE deleting style
      const historyStore = useHistoryStore.getState();
      historyStore.record(
        { 
          project: {
            styles: [...currentProject.styles],
            subtitles: [...currentProject.subtitles]
          }
        },
        'Before deleting style',
        true // Mark as internal
      );
      
      // Update any subtitles using this style to use the default style
      const updatedSubtitles = currentProject.subtitles.map(sub => {
        const needsUpdate = sub.spans.some(span => span.styleId === id);
        if (!needsUpdate) return sub;
        
        return {
          ...sub,
          spans: sub.spans.map(span => 
            span.styleId === id ? { ...span, styleId: 'default' } : span
          )
        };
      });
      
      // Create updated styles array
      const updatedStyles = currentProject.styles.filter(s => s.id !== id);
      
      // Update the project
      set({
        currentProject: {
          ...currentProject,
          styles: updatedStyles,
          subtitles: updatedSubtitles
        },
        isModified: true,
      });
      
      // Record state AFTER deleting style
      historyStore.record(
        { 
          project: {
            styles: updatedStyles,
            subtitles: updatedSubtitles
          }
        },
        `Deleted style "${styleToDelete.name}"`
      );
    }
  },
});