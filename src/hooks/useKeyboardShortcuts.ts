// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Note: we do not currently use React hooks like useEffect here, but keeping react imported ensures hotkeys work in strict mode.
// (If linter complains, this comment silences it.)
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTimelineStore } from '../stores/timelineStore';
import { useProjectStore } from '../stores/projectStore';
import { useHistoryStore } from '../stores/historyStore';
import { useLayoutStore } from '../stores/layoutStore';
import { useProjectSave } from './useProjectSave';
import { useClipboardStore } from '../stores/clipboardStore';
import { useSelectedSubtitleStore } from '../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../stores/subtitleHighlightStore';
import { SubtitleBlock } from '../types/project';
import { useSelectedTrackStore } from '../stores/selectedTrackStore';

export const useKeyboardShortcuts = () => {
  const { 
    currentTime, 
    isPlaying, 
    setPlaying, 
    setCurrentTime, 
    fps
  } = useTimelineStore();
  
  const { saveProject } = useProjectStore();
  const { saveProjectToFileSystem } = useProjectSave();

  // History actions
  const { undo, redo, isBusy } = useHistoryStore();

  // Layout actions
  const { focusedAreaId, coverArea } = useLayoutStore();

  // Play/Pause
  useHotkeys('space', (e) => {
    e.preventDefault();
    setPlaying(!isPlaying);
  }, [isPlaying]);

  // ──────────────────────────────────
  // Undo / Redo
  // Ctrl+Z / Cmd+Z
  useHotkeys('ctrl+z, meta+z', (e) => {
    if (isBusy) return;
    e.preventDefault();
    undo();
  }, [undo]);

  // Ctrl+Y, Ctrl+Shift+Z, Alt+Z, or Cmd+Shift+Z (mac)
  useHotkeys('ctrl+y, ctrl+shift+z, alt+z, meta+shift+z', (e) => {
    if (isBusy) return;
    e.preventDefault();
    redo();
  }, [redo]);

  // Save Project (Ctrl+S) - Save to file system
  useHotkeys('ctrl+s, meta+s', (e) => {
    e.preventDefault();
    saveProjectToFileSystem();
  }, [saveProjectToFileSystem]);

  // Quick Save (Ctrl+Shift+S) - Update timestamp only
  useHotkeys('ctrl+shift+s, meta+shift+s', (e) => {
    e.preventDefault();
    saveProject();
  }, [saveProject]);

  // Frame Navigation
  useHotkeys('left', (e) => {
    e.preventDefault();
    const frameDuration = 1000 / fps;
    setCurrentTime(currentTime - frameDuration);
  }, [currentTime, fps]);

  useHotkeys('right', (e) => {
    e.preventDefault();
    const frameDuration = 1000 / fps;
    setCurrentTime(currentTime + frameDuration);
  }, [currentTime, fps]);

  // 10 Frame jumps
  useHotkeys('shift+left', (e) => {
    e.preventDefault();
    const frameDuration = (1000 / fps) * 10;
    setCurrentTime(currentTime - frameDuration);
  }, [currentTime, fps]);

  useHotkeys('shift+right', (e) => {
    e.preventDefault();
    const frameDuration = (1000 / fps) * 10;
    setCurrentTime(currentTime + frameDuration);
  }, [currentTime, fps]);

  // Go to start/end
  useHotkeys('home', (e) => {
    e.preventDefault();
    setCurrentTime(0);
  });

  useHotkeys('end', (e) => {
    e.preventDefault();
    const { duration } = useTimelineStore.getState();
    setCurrentTime(duration);
  });

  // 영역 덮기 단축키 (Ctrl+Alt+방향키)
  useHotkeys('ctrl+alt+up', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'top');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+down', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'bottom');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+left', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'left');
    }
  }, [focusedAreaId, coverArea]);

  useHotkeys('ctrl+alt+right', (e) => {
    e.preventDefault();
    if (focusedAreaId) {
      coverArea(focusedAreaId, 'right');
    }
  }, [focusedAreaId, coverArea]);

  // ──────────────────────────────────
  // Keyframe Copy / Paste

  // Copy selected keyframe (Ctrl+C / Cmd+C) - Only in keyframe panel
  useHotkeys('ctrl+c, meta+c', (e) => {
    // 키프레임 패널에 포커스가 있을 때만 작동
    const { focusedAreaId } = useLayoutStore.getState();
    if (!focusedAreaId || !focusedAreaId.includes('keyframe')) {
      return; // 키프레임 패널이 아닌 경우 기본 동작 허용
    }
    
    e.preventDefault();
    const { selectedSubtitleId, selectedKeyframe } = useSelectedSubtitleStore.getState();
    const { currentProject } = useProjectStore.getState();
    if (!selectedSubtitleId || !currentProject || !selectedKeyframe) return;

    const subtitle = currentProject.subtitles.find(sub => sub.id === selectedSubtitleId);
    if (!subtitle || !subtitle.spans[0]?.animations) return;

    // 선택된 키프레임 찾기
    const anim = subtitle.spans[0].animations.find((a: any) => a.property === selectedKeyframe.property);
    if (!anim) return;

    const keyframe = anim.keyframes.find((kf: any) => kf.time === selectedKeyframe.time);
    if (!keyframe) return;

    // 키프레임 복사
    useClipboardStore.getState().setCopiedKeyframe({
      property: selectedKeyframe.property,
      time: keyframe.time,
      value: keyframe.value,
      easingId: keyframe.easingId
    });
  }, []);

  // Paste keyframe at playhead (Ctrl+V / Cmd+V) - Only in keyframe panel
  useHotkeys('ctrl+v, meta+v', (e) => {
    // 키프레임 패널에 포커스가 있을 때만 작동
    const { focusedAreaId } = useLayoutStore.getState();
    if (!focusedAreaId || !focusedAreaId.includes('keyframe')) {
      return; // 키프레임 패널이 아닌 경우 기본 동작 허용
    }
    
    e.preventDefault();
    const clipboardKeyframe = useClipboardStore.getState().copiedKeyframe;
    if (!clipboardKeyframe) return;

    const { selectedSubtitleId } = useSelectedSubtitleStore.getState();
    const { currentProject, addKeyframe } = useProjectStore.getState();
    if (!selectedSubtitleId || !currentProject) return;

    const { currentTime, snapToFrame } = useTimelineStore.getState();
    const newTime = snapToFrame(currentTime);

    // 키프레임 추가
    addKeyframe(selectedSubtitleId, clipboardKeyframe.property, {
      time: newTime,
      value: clipboardKeyframe.value,
      easingId: clipboardKeyframe.easingId
    });

    // 새로 추가된 키프레임을 선택 상태로 설정
    useSelectedSubtitleStore.getState().setSelectedKeyframe({
      property: clipboardKeyframe.property,
      time: newTime
    });
  }, []);

  // ──────────────────────────────────
  // Subtitle Copy / Paste

  // Copy selected subtitle (Ctrl+C / Cmd+C) - Only in timeline panel
  useHotkeys('ctrl+c, meta+c', (e) => {
    // 타임라인 패널에 포커스가 있을 때만 작동
    const { focusedAreaId } = useLayoutStore.getState();
    if (!focusedAreaId || !focusedAreaId.includes('timeline')) {
      return; // 타임라인 패널이 아닌 경우 기본 동작 허용
    }
    
    e.preventDefault();
    const { selectedSubtitleId } = useSelectedSubtitleStore.getState();
    const { currentProject } = useProjectStore.getState();
    if (!selectedSubtitleId || !currentProject) return;

    const subtitle = currentProject.subtitles.find(sub => sub.id === selectedSubtitleId);
    if (subtitle) {
      // 깊은 복사로 클립보드 저장
      const cloned = JSON.parse(JSON.stringify(subtitle)) as SubtitleBlock;
      useClipboardStore.getState().setCopiedSubtitle(cloned);
    }
  }, []);

  // Paste subtitle at playhead (Ctrl+V / Cmd+V) - Only in timeline panel
  useHotkeys('ctrl+v, meta+v', (e) => {
    // 타임라인 패널에 포커스가 있을 때만 작동
    const { focusedAreaId } = useLayoutStore.getState();
    if (!focusedAreaId || !focusedAreaId.includes('timeline')) {
      return; // 타임라인 패널이 아닌 경우 기본 동작 허용
    }
    
    e.preventDefault();

    const clipboardSubtitle = useClipboardStore.getState().copiedSubtitle;
    if (!clipboardSubtitle) return;

    const { currentProject, addSubtitle } = useProjectStore.getState();
    if (!currentProject) return;

    // 선택된 트랙 ID를 가져온다. 없으면 붙여넣기를 중단한다.
    const { selectedTrackId } = useSelectedTrackStore.getState();
    if (!selectedTrackId) return;

    const { currentTime, snapToFrame } = useTimelineStore.getState();
    const newStart = snapToFrame(currentTime);
    const duration = clipboardSubtitle.endTime - clipboardSubtitle.startTime;
    const newEnd = newStart + duration;
    const targetTrackId = selectedTrackId;

    // 중첩 검사 (선택된 트랙 기준)
    const overlapping = currentProject.subtitles.find(
      sub =>
        sub.trackId === targetTrackId &&
        newStart < sub.endTime &&
        newEnd > sub.startTime
    );

    if (overlapping) {
      useSubtitleHighlightStore.getState().flashIds([overlapping.id], 600);
      return;
    }

    const offset = newStart - clipboardSubtitle.startTime;

    const newSubtitle: SubtitleBlock = {
      ...clipboardSubtitle,
      id: crypto.randomUUID(),
      startTime: newStart,
      endTime: newEnd,
      trackId: targetTrackId,
      spans: clipboardSubtitle.spans.map(span => ({
        ...span,
        id: crypto.randomUUID(),
        startTime: span.startTime + offset,
        endTime: span.endTime + offset,
      })),
    };

    addSubtitle(newSubtitle);
    useSelectedSubtitleStore.getState().setSelectedSubtitleId(newSubtitle.id);
  }, []);
};