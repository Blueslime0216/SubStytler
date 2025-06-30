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
    // Ensure at least one track exists
    if (!project.tracks || project.tracks.length === 0) {
      project.tracks = [
        {
          id: 'default',
          name: 'Default Track',
          detail: '',
          visible: true,
          locked: false,
        }
      ];
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
    
    // 변경 전 상태 기록 (internal=true) ➜ 히스토리 패널에 표시하지 않음
    useHistoryStore.getState().record(
      { project: { ...currentProject } },
      'Before project update',
      true
    );

    // 적용 후 상태 계산
    const updatedProject = {
      ...currentProject,
      ...updates,
      updatedAt: Date.now(),
    };

    set({ currentProject: updatedProject, isModified: true });

    // 변경 후 상태 기록 (internal=false) ➜ 사용자에게 보임, undo/redo 대상
    setTimeout(() => {
      useHistoryStore.getState().record(
        { project: { ...updatedProject } },
        'Project updated'
      );
    }, 0);
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