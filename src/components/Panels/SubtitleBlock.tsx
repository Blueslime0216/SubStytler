import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../../stores/subtitleHighlightStore';
import { useSnapHighlightStore } from '../../stores/snapHighlightStore';
import { useSnapStore } from '../../stores/snapStore';
import { SubtitleBlock as SubtitleBlockType } from '../../types/project';
import { useHistoryStore } from '../../stores/historyStore';
import { snapToTimelineGrid } from '../../utils/timeUtils';

interface SubtitleBlockProps {
  subtitle: SubtitleBlockType;
  timeToPixel: (time: number) => number;
  pixelToTime: (pixel: number) => number;
  containerRef: React.RefObject<HTMLDivElement>;
  onDragStart: (subtitleId: string, trackId: string) => void;
  onDragEnd: () => void;
  isLocked: boolean;
  trackIndex: number;
  trackHeight: number;
  isHiddenTrack?: boolean;
}

export const SubtitleBlock: React.FC<SubtitleBlockProps> = ({
  subtitle,
  timeToPixel,
  pixelToTime,
  containerRef,
  onDragStart,
  onDragEnd,
  isLocked,
  trackIndex,
  trackHeight = 50,
  isHiddenTrack = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [isDropInvalid, setIsDropInvalid] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const dragStartData = useRef<{
    startTime: number;
    startX: number;
    startY: number;
    containerRect: DOMRect;
    originalTrackId: string;
    pointerOffsetX: number;
  } | null>(null);
  
  const { updateSubtitle } = useProjectStore();
  const { snapToFrame, duration, fps } = useTimelineStore();
  const { selectedSubtitleId, setSelectedSubtitleId } = useSelectedSubtitleStore();
  const { highlightedIds, setHighlightedIds } = useSubtitleHighlightStore();
  const { snapIds, setSnapIds, clear: clearSnapIds } = useSnapHighlightStore();
  const { enabled: isSnapEnabled } = useSnapStore();
  const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);
  const resizeStartData = useRef<{ startX: number; startTime: number; endTime: number } | null>(null);
  const prevOverlapRef = useRef<string[]>([]);
  const [isResizeInvalid, setIsResizeInvalid] = useState(false);
  const resizeAdjustmentsRef = useRef<{ id: string; updates: { startTime?: number; endTime?: number } }[]>([]);
  
  // Flag to track if we've already recorded the initial state for this resize operation
  const hasRecordedInitialState = useRef<boolean>(false);
  
  const left = timeToPixel(subtitle.startTime);
  const width = timeToPixel(subtitle.endTime) - left;
  
  // Determine visibility **without** causing early hook-return.
  const containerWidth = containerRef.current?.clientWidth || 0;
  const BUFFER = 100; // px to allow block (and shadow) partially outside before hiding
  const isOutsideView =
    !isDragging && (!containerRef.current || left + width < -BUFFER || left > containerWidth + BUFFER);

  const subtitleDuration = subtitle.endTime - subtitle.startTime;

  // Selected state
  const isSelected = selectedSubtitleId === subtitle.id;
  const isHighlighted = highlightedIds.has(subtitle.id);
  const isSnapHighlighted = snapIds.has(subtitle.id);

  const dragThreshold = 4; // px

  // Get the first span for display
  const span = subtitle.spans[0] || { text: '' };
  const isBold = span.isBold || false;
  const isItalic = span.isItalic || false;
  const isUnderline = span.isUnderline || false;

  // 🆕 Record initial state before drag or resize
  const recordInitialState = useCallback(() => {
    // Only record if we haven't already for this operation
    if (hasRecordedInitialState.current) return;
    
    const { currentProject } = useProjectStore.getState();
    if (!currentProject) return;
    
    useHistoryStore.getState().record(
      { 
        project: {
          subtitles: [...currentProject.subtitles],
          selectedSubtitleId
        }
      },
      'Before moving subtitle',
      true // Mark as internal
    );
    
    // Set flag to prevent duplicate recordings
    hasRecordedInitialState.current = true;
  }, [selectedSubtitleId]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked || e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const elementRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate time-per-pixel at drag start
    const { viewStart, viewEnd } = useTimelineStore.getState();
    const viewDurationStart = viewEnd - viewStart;
    const timePerPixelStart = viewDurationStart / containerRect.width;
    const subtitleLeftPxStart = (subtitle.startTime - viewStart) / timePerPixelStart;
    const pointerOffsetX = e.clientX - containerRect.left - subtitleLeftPxStart;
    
    dragStartData.current = {
      startTime: subtitle.startTime,
      startX: e.clientX,
      startY: e.clientY,
      containerRect,
      originalTrackId: subtitle.trackId,
      pointerOffsetX,
    };
    
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
    setMouseDown(true);
    // Immediate selection
    setSelectedSubtitleId(subtitle.id);
  }, [isLocked, subtitle, containerRef, setSelectedSubtitleId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseDown || !dragStartData.current) return;

    const deltaXFromStart = e.clientX - dragStartPos.x;
    const deltaYFromStart = e.clientY - dragStartPos.y;

    // If drag not started yet, check threshold
    if (!isDragging) {
      if (Math.abs(deltaXFromStart) < dragThreshold && Math.abs(deltaYFromStart) < dragThreshold) {
        return; // still a click
      }

      // Start drag
      setIsDragging(true);
      onDragStart(subtitle.id, subtitle.trackId);
      
      // 🆕 Record initial state for undo
      recordInitialState();
    }

    let deltaX = deltaXFromStart;

    // Determine which track we're currently hovering over and snap vertically
    const { containerRect } = dragStartData.current;
    // Include vertical scroll offset so drag position accounts for scrolled container
    const scrollTop = containerRef.current?.scrollTop || 0;
    const relativeY = e.clientY - containerRect.top + scrollTop - 40; // 40px ruler height + scroll offset
    const { currentProject } = useProjectStore.getState();
    const tracksCount = currentProject?.tracks.length ?? 0;
    let targetTrackIndex = Math.floor(relativeY / trackHeight);
    targetTrackIndex = Math.max(0, Math.min(tracksCount - 1, targetTrackIndex));

    const offsetTrack = targetTrackIndex - trackIndex;
    const snappedY = offsetTrack * trackHeight;

    // Recompute using current zoom so that dragging during wheel zoom stays accurate
    const containerNow = containerRef.current;
    if (!containerNow) return;

    const { viewStart, viewEnd, snapToFrame } = useTimelineStore.getState();
    const viewDuration = viewEnd - viewStart;
    const timePerPixel = viewDuration / containerNow.clientWidth;

    const pointerOffsetX = dragStartData.current.pointerOffsetX;
    const newStartPx = e.clientX - containerNow.getBoundingClientRect().left - pointerOffsetX;

    let tempStartTime = viewStart + newStartPx * timePerPixel;
    if (isSnapEnabled && containerNow) {
      tempStartTime = snapToTimelineGrid(tempStartTime, viewStart, viewEnd, containerNow.clientWidth, fps);
    } else {
      tempStartTime = snapToFrame(tempStartTime);
    }
    tempStartTime = Math.max(0, Math.min(duration - subtitleDuration, tempStartTime));
    const tempEndTime = tempStartTime + subtitleDuration;

    // For visual offset relative to current zoom/time mapping
    const leftCurrent = timeToPixel(dragStartData.current.startTime);
    deltaX = newStartPx - leftCurrent;

    const targetTrack = currentProject?.tracks[targetTrackIndex];
    let isInvalid = false;
    const overlappingIds: string[] = [];

    if (targetTrack && !targetTrack.locked) {
      const otherSubtitles = currentProject.subtitles.filter(
        s => s.trackId === targetTrack.id && s.id !== subtitle.id
      );
      for (const other of otherSubtitles) {
        if (other.id === subtitle.id) continue;
        const otherTrack = currentProject.tracks.find(t => t.id === other.trackId);
        if (otherTrack && !otherTrack.visible) continue; // 숨김 트랙은 스냅 대상으로 무시
        if (tempStartTime < other.endTime && tempEndTime > other.startTime) {
          isInvalid = true;
          overlappingIds.push(other.id);
        }
      }
    } else if (targetTrack?.locked) {
      isInvalid = true; // Cannot drop on locked track
    }
    setIsDropInvalid(isInvalid);

    // -------------------------------------------------------------
    // Snap Handling (position)
    // -------------------------------------------------------------
    const thresholdMs = (() => {
      const pixelsPerSecond = (1000 / viewDuration) * containerRect.width;
      const pixelsPerFrame = pixelsPerSecond / fps;
      const minMinor = 5;
      let frameStep = 1;
      if (pixelsPerFrame < minMinor) {
        frameStep = Math.ceil(minMinor / pixelsPerFrame);
        if (frameStep > 2 && frameStep <= 5) frameStep = 5;
        else if (frameStep > 5 && frameStep <= 10) frameStep = 10;
        else if (frameStep > 10 && frameStep <= 30) frameStep = 30;
        else if (frameStep > 30) frameStep = 60;
      }
      const frameDuration = 1000 / fps;
      return 3 * frameStep * frameDuration;
    })();

    const snapCandidateIds: string[] = [];
    let snapAdjustmentTime = 0;

    if (isSnapEnabled && !e.altKey && currentProject) {
      let closestDiff = thresholdMs + 1;
      const targetStart = tempStartTime;
      const targetEnd = tempEndTime;

      for (const other of currentProject?.subtitles || []) {
        if (other.id === subtitle.id) continue;
        const otherTrack = currentProject.tracks.find(t => t.id === other.trackId);
        if (otherTrack && !otherTrack.visible) continue; // 숨김 트랙은 스냅 대상으로 무시
        for (const edge of [other.startTime, other.endTime]) {
          // Check against start edge
          let diff = targetStart - edge;
          if (Math.abs(diff) < Math.abs(closestDiff)) {
            closestDiff = diff;
            snapAdjustmentTime = -diff;
            snapCandidateIds.length = 0;
            snapCandidateIds.push(other.id);
          } else if (Math.abs(diff) === Math.abs(closestDiff)) {
            snapCandidateIds.push(other.id);
          }
          // Check against end edge
          diff = targetEnd - edge;
          if (Math.abs(diff) < Math.abs(closestDiff)) {
            closestDiff = diff;
            snapAdjustmentTime = -diff;
            snapCandidateIds.length = 0;
            snapCandidateIds.push(other.id);
          } else if (Math.abs(diff) === Math.abs(closestDiff)) {
            snapCandidateIds.push(other.id);
          }
        }
      }

      if (Math.abs(closestDiff) <= thresholdMs) {
        // apply snap adjustment
        deltaX += (snapAdjustmentTime / timePerPixel);
        setSnapIds([subtitle.id, ...snapCandidateIds]);
      } else {
        clearSnapIds();
      }
    } else {
      clearSnapIds();
    }

    setDragOffset({ x: deltaX, y: snappedY });

    setHighlightedIds(overlappingIds);

  }, [mouseDown, isDragging, dragStartPos, trackHeight, trackIndex, subtitle.id, subtitle.trackId, onDragStart, duration, subtitleDuration, setHighlightedIds, recordInitialState, isSnapEnabled, clearSnapIds, setSnapIds]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!mouseDown) return;
    
    const container = containerRef.current;
    if (!container || !dragStartData.current) {
      setMouseDown(false);
      setIsDragging(false);
      dragStartData.current = null;
      return;
    }
    
    const { startTime, containerRect, originalTrackId } = dragStartData.current;
    
    // Recompute startTime based on current mouse X, considering possible zoom changes
    const { viewStart: viewStartNow, viewEnd: viewEndNow } = useTimelineStore.getState();
    const viewDurationNow = viewEndNow - viewStartNow;
    const timePerPixelNow = viewDurationNow / container.clientWidth;

    const subtitleLeftPxNow = (e.clientX - containerRect.left) - dragStartData.current.pointerOffsetX;
    let newStartTime = viewStartNow + subtitleLeftPxNow * timePerPixelNow;
    
    // Clamp to valid range
    newStartTime = Math.max(0, Math.min(duration - subtitleDuration, newStartTime));
    
    // Snap to frame first
    newStartTime = snapToFrame(newStartTime);

    let newEndTime = newStartTime + subtitleDuration;

    // Apply subtitle-edge snapping on drop (same threshold calc) if enabled and Alt not pressed
    const { fps } = useTimelineStore.getState();
    const thresholdMs = (() => {
      const pixelsPerSecond = (1000 / viewDurationNow) * container.clientWidth;
      const pixelsPerFrame = pixelsPerSecond / fps;
      const minMinor = 5;
      let frameStep = 1;
      if (pixelsPerFrame < minMinor) {
        frameStep = Math.ceil(minMinor / pixelsPerFrame);
        if (frameStep > 2 && frameStep <= 5) frameStep = 5;
        else if (frameStep > 5 && frameStep <= 10) frameStep = 10;
        else if (frameStep > 10 && frameStep <= 30) frameStep = 30;
        else if (frameStep > 30) frameStep = 60;
      }
      return 3 * frameStep * (1000 / fps);
    })();

    const snapCandidateIds: string[] = [];
    const currentProject = useProjectStore.getState().currentProject;
    if (isSnapEnabled && !e.altKey && currentProject) {
      let closestDiff = thresholdMs + 1;
      for (const other of currentProject?.subtitles || []) {
        if (other.id === subtitle.id) continue;
        const otherTrack = currentProject.tracks.find(t => t.id === other.trackId);
        if (otherTrack && !otherTrack.visible) continue; // 숨김 트랙 무시
        for (const edge of [other.startTime, other.endTime]) {
          const diffStart = newStartTime - edge;
          if (Math.abs(diffStart) < Math.abs(closestDiff)) {
            closestDiff = diffStart;
            snapCandidateIds.length = 0;
            snapCandidateIds.push(other.id);
          } else if (Math.abs(diffStart) === Math.abs(closestDiff)) {
            snapCandidateIds.push(other.id);
          }
        }
      }
      if (Math.abs(closestDiff) <= thresholdMs) {
        newStartTime = newStartTime - closestDiff;
      }
    }

    // Recompute end time to preserve original duration after possible snap adjustment
    newEndTime = newStartTime + subtitleDuration;

    // Determine target track based on Y position
    const tracks = currentProject?.tracks;
    if (!tracks) return;
    // Include vertical scroll offset when determining drop track on mouse up
    const scrollTop = containerRef.current?.scrollTop || 0;
    const relativeY = e.clientY - containerRect.top + scrollTop - 40; // Account for ruler height + scroll offset
    const targetTrackIndex = Math.floor(relativeY / trackHeight);
    const targetTrack = tracks[targetTrackIndex];
    
    // --- Final Overlap Check on Drop ---
    let isInvalidOnDrop = false;
    if (targetTrack && !targetTrack.locked) {
      const otherSubtitles = currentProject.subtitles.filter(
        s => s.trackId === targetTrack.id && s.id !== subtitle.id
      );
      for (const other of otherSubtitles) {
        if (newStartTime < other.endTime && newEndTime > other.startTime) {
          isInvalidOnDrop = true;
          break;
        }
      }
    } else {
      isInvalidOnDrop = true; // Drop on locked track or outside any track is invalid
    }

    if (!isInvalidOnDrop) {
      const updates: any = { 
        startTime: newStartTime, 
        endTime: newEndTime 
      };

      // Update track if valid and different
      if (targetTrack && targetTrack.id !== originalTrackId && !targetTrack.locked) {
        updates.trackId = targetTrack.id;
      }

      updateSubtitle(subtitle.id, updates, false);
      
      // 🆕 Record final state for redo
      if (isDragging) {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          let description = 'Moved subtitle';
          if (targetTrack && targetTrack.id !== originalTrackId && !targetTrack.locked) {
            description = `Moved subtitle to track "${targetTrack.name}"`;
          }
          
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId
              }
            },
            description
          );
        }
      }
    }
    // If drop is invalid, do nothing. The state reset below will cause a snap-back.

    // Reset drag state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    dragStartData.current = null;
    setMouseDown(false);
    onDragEnd();
    setIsDropInvalid(false);
    setHighlightedIds([]);
    clearSnapIds();
    
    // Reset the initial state recording flag
    hasRecordedInitialState.current = false;
  }, [mouseDown, isDragging, dragStartPos, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame, duration, subtitle.id, setHighlightedIds, selectedSubtitleId, isSnapEnabled]);

  // Click to select (only when not dragging)
  const handleClick = useCallback(() => {
    if (isDragging) return;
    setSelectedSubtitleId(subtitle.id);
  }, [isDragging, setSelectedSubtitleId, subtitle.id]);

  /* ------------------------------------------------------------------
     Resize (left / right handle)
  ------------------------------------------------------------------ */

  const startResize = (e: React.MouseEvent, side: 'left' | 'right') => {
    if (isLocked || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setResizeSide(side);
    resizeStartData.current = {
      startX: e.clientX,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
    };
    setSelectedSubtitleId(subtitle.id);
    
    // Record initial state for undo
    recordInitialState();
  };

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
        newStart = startTime + deltaTime;
        if(isSnapEnabled && containerRef.current){
          newStart = snapToTimelineGrid(newStart, viewStart, viewEnd, containerRef.current.clientWidth, fps);
        } else {
          newStart = snapToFrame(newStart);
        }
        // Ensure start time doesn't exceed end time minus minimum duration
        newStart = Math.min(newStart, endTime - MIN_DURATION);
        // Ensure start time isn't negative
        newStart = Math.max(0, newStart);
      } else {
        newEnd = endTime + deltaTime;
        if(isSnapEnabled && containerRef.current){
          newEnd = snapToTimelineGrid(newEnd, viewStart, viewEnd, containerRef.current.clientWidth, fps);
        } else {
          newEnd = snapToFrame(newEnd);
        }
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
      const adjustments: { id: string; updates: { startTime?: number; endTime?: number } }[] = [];
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
    [resizeSide, containerRef, duration, subtitle.id, updateSubtitle, subtitle.trackId, isSnapEnabled, fps]
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
    
    // 🆕 Record final state for redo - only at the end of resize
    const { currentProject: updatedProject } = useProjectStore.getState();
    if (updatedProject) {
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: updatedProject.subtitles,
            selectedSubtitleId
          }
        },
        `Resized subtitle ${resizeSide === 'left' ? 'start' : 'end'} time`
      );
    }
    
    // Reset the initial state recording flag
    hasRecordedInitialState.current = false;
  }, [resizeSide, isResizeInvalid, updateSubtitle, selectedSubtitleId]);

  // Global mouse event listeners
  React.useEffect(() => {
    if (mouseDown || resizeSide) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // resize listeners
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeUp);
      };
    }
  }, [mouseDown, resizeSide, handleMouseMove, handleMouseUp, handleResizeMove, handleResizeUp]);

  // If the block is outside of the current viewport, render nothing **after** all hooks have been invoked.
  if (isOutsideView) {
    return null;
  }

  // Calculate the display width - ensure it's never negative
  const displayWidth = Math.max(1, width);

  return (
    <motion.div
      className={`neu-subtitle-block absolute ${!isLocked ? 'cursor-move' : 'cursor-not-allowed'}`}
      style={{
        left: left + (isDragging ? dragOffset.x : 0),
        width: displayWidth, // Use the non-negative width
        top: `${7 + (isDragging ? dragOffset.y : 0)}px`,
        height: '36px',
        opacity: isLocked ? 0.7 : 1,
        zIndex: isDragging ? 1000 : 10,
        pointerEvents: isDragging ? 'none' : 'auto',
        outline: isSelected ? '2px solid var(--highlight-color)' : 'none',
        backgroundColor: (isDragging && isDropInvalid) || isResizeInvalid ? 'var(--error-color)' : 'var(--mid-color)',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Drag to move`}
      tabIndex={0}
      animate={{
        scale: isDragging ? 1.05 : 1,
        boxShadow: isDragging ? "0 8px 25px rgba(0,0,0,0.3)" : "var(--shadow-outset-subtle)",
      }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            className="neu-subtitle-highlight-pulse"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 0.6 }}
            exit={{ scale: 1, opacity: 0, transition: { duration: 0.05 } }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>
      <div 
        className="text-sm text-white font-semibold truncate"
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none'
        }}
      >
        {span.text || 'Empty subtitle'}
      </div>
      
      {/* Visual indicator when dragging */}
      {isDragging && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-400 rounded-lg pointer-events-none" />
      )}

      {/* Resize Handles */}
      {!isLocked && (
        <>
          <div
            className="neu-subtitle-handle left-0"
            onMouseDown={(e) => startResize(e, 'left')}
          />
          <div
            className="neu-subtitle-handle right-0"
            onMouseDown={(e) => startResize(e, 'right')}
          />
        </>
      )}
    </motion.div>
  );
};

export default SubtitleBlock;