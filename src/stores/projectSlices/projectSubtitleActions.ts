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

      // Ensure the subtitle has a styleId (default if not specified) and 시간 정수화
      const updatedSubtitle = {
        ...subtitle,
        startTime: Math.round(subtitle.startTime),
        endTime: Math.round(subtitle.endTime),
        spans: subtitle.spans.map(span => ({
          ...span,
          // 스타일 ID는 더 이상 사용하지 않음
          isBold: span.isBold || false,
          isItalic: span.isItalic || false,
          isUnderline: span.isUnderline || false,
          startTime: Math.round(span.startTime ?? 0),
          endTime: Math.round(span.endTime ?? 0),
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

  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>, recordHistory = true) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the subtitle to update
      const subtitleToUpdate = currentProject.subtitles.find((sub: SubtitleBlock) => sub.id === id);
      if (!subtitleToUpdate) return;

      // 🆕 Record state BEFORE updating subtitle
      if (recordHistory) {
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
      }

      // 시간 정수화
      const roundedUpdates: Partial<SubtitleBlock> = { ...updates };
      if (updates.startTime !== undefined) {
        roundedUpdates.startTime = Math.round(updates.startTime);
      }
      if (updates.endTime !== undefined) {
        roundedUpdates.endTime = Math.round(updates.endTime);
      }

      // 이동 시 키프레임 시간도 같이 이동
      const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
        if (sub.id !== id) return sub;

        // 계산할 업데이트를 적용하기 전에 복사본을 만듭니다.
        const newSub: SubtitleBlock = { ...sub, ...roundedUpdates } as SubtitleBlock;

        // startTime 변경이 있는 경우 키프레임 시간 보정
        if (roundedUpdates.startTime !== undefined && roundedUpdates.startTime !== sub.startTime) {
          const delta = Math.round(roundedUpdates.startTime - sub.startTime);
          if (delta !== 0) {
            const spansCopy = newSub.spans.map((sp) => {
              if (!sp.animations) return sp;
              const animCopy = sp.animations.map((anim: any) => {
                const kfs = anim.keyframes.map((kf: any) => ({ ...kf, time: Math.max(0, kf.time + delta) }));
                return { ...anim, keyframes: kfs };
              });
              return { ...sp, animations: animCopy };
            });
            newSub.spans = spansCopy as any;
          }
        }

        return newSub;
      });

      // Update the project
      set({
        currentProject: {
          ...currentProject,
          subtitles: updatedSubtitles,
        },
        isModified: true,
      });

      // Generate appropriate description based on what was updated
      if (recordHistory) {
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
        const historyStore = useHistoryStore.getState();
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
    }
  },

  deleteSubtitle: (id: string) => {
    const { currentProject } = get();
    if (currentProject) {
      // Find the subtitle to delete
      const subtitleToDelete = currentProject.subtitles.find((sub: SubtitleBlock) => sub.id === id);
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
      const updatedSubtitles = currentProject.subtitles.filter((sub: SubtitleBlock) => sub.id !== id);

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

  /**
   * Add a keyframe to a subtitle's animation for given property.
   */
  addKeyframe: (
    subtitleId: string,
    property: string,
    keyframe: { time: number; value: any; easingId?: string },
  ) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
      if (sub.id !== subtitleId) return sub;

      // Clone spans to avoid mutating original directly
      const spansCopy = sub.spans.map((s) => ({ ...s }));
      const firstSpan = spansCopy[0];
      const animations: any[] = firstSpan.animations ? [...firstSpan.animations] : [];

      let animIndex = animations.findIndex((a) => a.property === property);
      if (animIndex === -1) {
        animations.push({ id: property, property, keyframes: [], duration: 0 });
        animIndex = animations.length - 1;
      }

      const anim = animations[animIndex];
      anim.keyframes = [...anim.keyframes, keyframe].sort((a: any, b: any) => a.time - b.time);

      firstSpan.animations = animations;

      return {
        ...sub,
        spans: spansCopy,
      };
    });

    // Record history
    const historyStore = useHistoryStore.getState();
    historyStore.record(
      { project: { subtitles: currentProject.subtitles } },
      'Add keyframe',
      true,
    );

    set({
      currentProject: { ...currentProject, subtitles: updatedSubtitles },
      isModified: true,
    });

    historyStore.record(
      { project: { subtitles: updatedSubtitles } },
      `Added keyframe (${property})`,
    );
  },

  /**
   * Move a keyframe to new time (and optionally change easing).
   */
  moveKeyframe: (
    subtitleId: string,
    property: string,
    oldTime: number,
    newTime: number,
  ) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
      if (sub.id !== subtitleId) return sub;

      const spansCopy = sub.spans.map((s) => ({ ...s }));
      const firstSpan = spansCopy[0];
      const animations: any[] = firstSpan.animations ? [...firstSpan.animations] : [];
      const anim = animations.find((a) => a.property === property);
      if (!anim) return sub;

      const kfIndex = anim.keyframes.findIndex((k: any) => k.time === oldTime);
      if (kfIndex === -1) return sub;
      const kf = { ...anim.keyframes[kfIndex], time: newTime };
      anim.keyframes[kfIndex] = kf;
      anim.keyframes.sort((a: any, b: any) => a.time - b.time);

      firstSpan.animations = animations;
      return { ...sub, spans: spansCopy };
    });

    const historyStore = useHistoryStore.getState();
    historyStore.record({ project: { subtitles: currentProject.subtitles } }, 'Move keyframe', true);

    set({ currentProject: { ...currentProject, subtitles: updatedSubtitles }, isModified: true });

    historyStore.record({ project: { subtitles: updatedSubtitles } }, 'Keyframe moved');
  },

  /**
   * Update easingId of a keyframe.
   */
  setKeyframeEasing: (
    subtitleId: string,
    property: string,
    time: number,
    easingId: string,
  ) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
      if (sub.id !== subtitleId) return sub;

      const spansCopy = sub.spans.map((s) => ({ ...s }));
      const firstSpan = spansCopy[0];
      const animations: any[] = firstSpan.animations ? [...firstSpan.animations] : [];
      const anim = animations.find((a) => a.property === property);
      if (!anim) return sub;

      const kf = anim.keyframes.find((k: any) => k.time === time);
      if (!kf) return sub;
      kf.easingId = easingId;

      firstSpan.animations = animations;
      return { ...sub, spans: spansCopy };
    });

    const historyStore = useHistoryStore.getState();
    historyStore.record({ project: { subtitles: currentProject.subtitles } }, 'Change keyframe easing', true);

    set({ currentProject: { ...currentProject, subtitles: updatedSubtitles }, isModified: true });

    historyStore.record({ project: { subtitles: updatedSubtitles } }, 'Keyframe easing changed');
  },

  deleteKeyframe: (
    subtitleId: string,
    property: string,
    time: number,
  ) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const prev = currentProject.subtitles;
    const updatedSubtitles = currentProject.subtitles.map((sub: SubtitleBlock) => {
      if (sub.id !== subtitleId) return sub;
      const spansCopy = sub.spans.map((s) => ({ ...s }));
      const firstSpan = spansCopy[0];
      const animations: any[] = firstSpan.animations ? [...firstSpan.animations] : [];
      const anim = animations.find((a) => a.property === property);
      if (!anim) return sub;
      anim.keyframes = anim.keyframes.filter((k: any) => k.time !== time);
      firstSpan.animations = animations;
      return { ...sub, spans: spansCopy };
    });

    const historyStore = useHistoryStore.getState();
    historyStore.record({ project: { subtitles: prev } }, 'Delete keyframe', true);
    set({ currentProject: { ...currentProject, subtitles: updatedSubtitles }, isModified: true });
    historyStore.record({ project: { subtitles: updatedSubtitles } }, 'Keyframe deleted');
  },
});