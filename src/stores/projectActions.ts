import { Project, SubtitleBlock, SubtitleStyle, VideoMeta } from '../types/project';
import { StateCreator } from 'zustand';
import { useHistoryStore, setSelectionSuppressed, isSelectionSuppressed } from './historyStore';
import { useSelectedTrackStore } from './selectedTrackStore';
import { useSelectedSubtitleStore } from './selectedSubtitleStore';
import { projectCoreActions } from './projectSlices/projectCoreActions';
import { projectSubtitleActions } from './projectSlices/projectSubtitleActions';
import { projectStyleActions } from './projectSlices/projectStyleActions';
import { projectTrackActions } from './projectSlices/projectTrackActions';

export const createProjectActions: StateCreator<any> = (set, get, _store) => ({
  ...projectCoreActions(set, get, _store),
  ...projectSubtitleActions(set, get, _store),
  ...projectStyleActions(set, get, _store),
  ...projectTrackActions(set, get, _store),
  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>, recordHistory = true) => {
    const currentProject = get().currentProject;
    if (currentProject) {
      const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) =>
        sub.id === id ? { ...sub, ...updates } : sub
      );

      set({
        currentProject: {
          ...currentProject,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });

      if (recordHistory) {
        useHistoryStore.getState().record(
          { project: { ...currentProject, subtitles: updatedSubtitles } },
          `Updated subtitle`
        );
      }
    }
  },
});