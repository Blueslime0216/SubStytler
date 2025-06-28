import { useState, useRef, useCallback } from 'react';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { ResizeSide, ResizeStartData, ResizeAdjustment } from './SubtitleBlockTypes';

export const useSubtitleResize = (
  subtitle: any,
  containerRef: React.RefObject<HTMLDivElement>,
  duration: number
) => {
  const [resizeSide, setResizeSide] = useState<ResizeSide>(null);
  const [isResizeInvalid, setIsResizeInvalid] = useState(false);
  const resizeStartData = useRef<ResizeStartData | null>(null);
  const resizeAdjustmentsRef = useRef<ResizeAdjustment[]>([]);
  
  // Flag to track if we've already recorded the initial state for this resize operation
  const hasRecordedInitialState = useRef<boolean>(false);
  
  const { updateSubtitle } = useProjectStore();
  
  // Record initial state before resize
  const recordInitialState = useCallback(() => {
    // Only record if we haven't already for this operation
    if (hasRecordedInitialState.current) return;
    
    const { currentProject } = useProjectStore.getState();
    if (!currentProject) return;
    
    useHistoryStore.getState().record(
      { 
        project: {
          subtitles: [...currentProject.subtitles],
          selectedSubtitleId: subtitle.id
        }
      },
      'Before resizing subtitle',
      true // Mark as internal
    );
    
    // Set flag to prevent duplicate recordings
    hasRecordedInitialState.current = true;
  }, [subtitle.id]);

  const startResize = useCallback((e: React.MouseEvent, side: ResizeSide) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setResizeSide(side);
    resizeStartData.current = {
      startX: e.clientX,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
    };
    
    // Record initial state for undo
    recordInitialState();
  }, [subtitle.startTime, subtitle.endTime, recordInitialState]);

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeSide || !resizeStartData.current || !containerRef.current) return;

      const { startX, startTime, endTime } = resizeStartData.current;
      const deltaX = e.clientX - startX;

      const containerWidth = containerRef.current.clientWidth;
      const { viewStart, viewEnd, snapToFrame } = useTimelineStore.getState();
      const viewDuration = viewEnd - viewStart;
      const timePerPixel = viewDuration / containerWidth;
      const deltaTime = deltaX * timePerPixel;

      let newStart = startTime;
      let newEnd = endTime;

      // Minimum duration in milliseconds (1 frame at 30fps as a reasonable default)
      const MIN_DURATION = 33.33; // ~1 frame at 30fps

      if (resizeSide === 'left') {
        newStart = snapToFrame(startTime + deltaTime);
        // Ensure start time doesn't exceed end time minus minimum duration
        newStart = Math.min(newStart, endTime - MIN_DURATION);
        // Ensure start time isn't negative
        newStart = Math.max(0, newStart);
      } else {
        newEnd = snapToFrame(endTime + deltaTime);
        // Ensure end time isn't less than start time plus minimum duration
        newEnd = Math.max(newEnd, startTime + MIN_DURATION);
        // Ensure end time doesn't exceed duration
        newEnd = Math.min(newEnd, duration);
      }

      // Collision detection
      const { currentProject } = useProjectStore.getState();
      if (!currentProject) return;
      const otherSubs = currentProject.subtitles.filter(s => s.trackId === subtitle.trackId && s.id !== subtitle.id);
      let fullCover = false;
      const adjustments: ResizeAdjustment[] = [];
      for (const other of otherSubs) {
        // 완전히 덮는 경우
        if (newStart <= other.startTime && newEnd >= other.endTime) {
          fullCover = true;
          break;
        }
        // 왼쪽 리사이즈: 본인 start가 다른 자막 내부로 들어가면 그 자막 end를 본인 start로
        if (resizeSide === 'left' && newStart > other.startTime && newStart < other.endTime && newEnd > other.endTime) {
          adjustments.push({ id: other.id, updates: { endTime: newStart } });
        }
        // 오른쪽 리사이즈: 본인 end가 다른 자막 내부로 들어가면 그 자막 start를 본인 end로
        if (resizeSide === 'right' && newEnd < other.endTime && newEnd > other.startTime && newStart < other.startTime) {
          adjustments.push({ id: other.id, updates: { startTime: newEnd } });
        }
      }
      setIsResizeInvalid(fullCover);
      resizeAdjustmentsRef.current = fullCover ? [] : adjustments;
      // 본인 자막은 실시간 반영하지 않고, 유효할 때만 MouseUp에서 반영
      // 빨간색 표시만 실시간으로
      updateSubtitle(subtitle.id, fullCover ? { startTime, endTime } : { startTime: newStart, endTime: newEnd }, false);
    },
    [resizeSide, containerRef, duration, subtitle.id, updateSubtitle, subtitle.trackId]
  );

  const handleResizeUp = useCallback(() => {
    if (!resizeSide || !resizeStartData.current) return;
    setResizeSide(null);
    // Defensive: copy and clear before any early return
    const resizeData = resizeStartData.current;
    resizeStartData.current = null;
    if (isResizeInvalid) {
      setIsResizeInvalid(false);
      return;
    }
    // 유효한 경우: 본인 자막과 겹친 자막들 업데이트
    if (!resizeData) return;
    const { currentProject } = useProjectStore.getState();
    if (!currentProject) return;
    // 실제 적용된 값은 이미 updateSubtitle로 반영되어 있으므로, 겹친 자막만 반영
    for (const adj of resizeAdjustmentsRef.current) {
      updateSubtitle(adj.id, adj.updates);
    }
    resizeAdjustmentsRef.current = [];
    
    // Record final state for redo - only at the end of resize
    const { currentProject: updatedProject } = useProjectStore.getState();
    if (updatedProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: updatedProject.subtitles,
            selectedSubtitleId: subtitle.id
          }
        },
        `Resized subtitle ${resizeSide === 'left' ? 'start' : 'end'} time`
      );
    }
    
    // Reset the initial state recording flag
    hasRecordedInitialState.current = false;
  }, [resizeSide, isResizeInvalid, updateSubtitle, subtitle.id]);

  return {
    resizeSide,
    isResizeInvalid,
    startResize,
    handleResizeMove,
    handleResizeUp
  };
};