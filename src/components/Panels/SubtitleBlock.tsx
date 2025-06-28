import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../../stores/subtitleHighlightStore';
import { SubtitleBlock as SubtitleBlockType } from '../../types/project';

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
  trackHeight = 50
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
  } | null>(null);
  
  const { updateSubtitle } = useProjectStore();
  const { snapToFrame, duration } = useTimelineStore();
  const { selectedSubtitleId, setSelectedSubtitleId } = useSelectedSubtitleStore();
  const { highlightedIds, setHighlightedIds } = useSubtitleHighlightStore();
  const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);
  const resizeStartData = useRef<{ startX: number; startTime: number; endTime: number } | null>(null);
  const prevOverlapRef = useRef<string[]>([]);
  const [isResizeInvalid, setIsResizeInvalid] = useState(false);
  const resizeAdjustmentsRef = useRef<{ id: string; updates: { startTime?: number; endTime?: number } }[]>([]);
  
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

  const dragThreshold = 4; // px

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked || e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const elementRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate offset from mouse to element's top-left corner
    const offsetX = e.clientX - elementRect.left;
    const offsetY = e.clientY - elementRect.top;
    
    dragStartData.current = {
      startTime: subtitle.startTime,
      startX: e.clientX,
      startY: e.clientY,
      containerRect,
      originalTrackId: subtitle.trackId
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
    }

    const deltaX = deltaXFromStart;

    // Determine which track we're currently hovering over and snap vertically
    const { containerRect } = dragStartData.current;
    const relativeY = e.clientY - containerRect.top - 40; // 40px ruler height
    const { currentProject } = useProjectStore.getState();
    const tracksCount = currentProject?.tracks.length ?? 0;
    let targetTrackIndex = Math.floor(relativeY / trackHeight);
    targetTrackIndex = Math.max(0, Math.min(tracksCount - 1, targetTrackIndex));

    const offsetTrack = targetTrackIndex - trackIndex;
    const snappedY = offsetTrack * trackHeight;

    setDragOffset({ x: deltaX, y: snappedY });

    // --- Overlap Detection ---
    const { viewStart, viewEnd, snapToFrame } = useTimelineStore.getState();
    const containerWidth = containerRect.width;
    const viewDuration = viewEnd - viewStart;
    const timePerPixel = viewDuration / containerWidth;
    const timeDelta = deltaX * timePerPixel;

    let tempStartTime = snapToFrame(dragStartData.current.startTime + timeDelta);
    tempStartTime = Math.max(0, Math.min(duration - subtitleDuration, tempStartTime));
    const tempEndTime = tempStartTime + subtitleDuration;
    
    const targetTrack = currentProject?.tracks[targetTrackIndex];
    let isInvalid = false;
    const overlappingIds: string[] = [];

    if (targetTrack && !targetTrack.locked) {
      const otherSubtitles = currentProject.subtitles.filter(
        s => s.trackId === targetTrack.id && s.id !== subtitle.id
      );
      for (const other of otherSubtitles) {
        if (tempStartTime < other.endTime && tempEndTime > other.startTime) {
          isInvalid = true;
          overlappingIds.push(other.id);
        }
      }
    } else if (targetTrack?.locked) {
      isInvalid = true; // Cannot drop on locked track
    }
    setIsDropInvalid(isInvalid);

    setHighlightedIds(overlappingIds);

  }, [mouseDown, isDragging, dragStartPos, trackHeight, trackIndex, subtitle.id, subtitle.trackId, onDragStart, duration, subtitleDuration, setHighlightedIds]);

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
    
    // Calculate new position based on final mouse position
    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;
    
    // Convert pixel movement to time
    const containerWidth = container.clientWidth;
    const { viewStart, viewEnd } = useTimelineStore.getState();
    const viewDuration = viewEnd - viewStart;
    
    const timePerPixel = viewDuration / containerWidth;
    const timeDelta = deltaX * timePerPixel;
    
    let newStartTime = startTime + timeDelta;
    
    // Clamp to valid range
    newStartTime = Math.max(0, Math.min(duration - subtitleDuration, newStartTime));
    
    // Snap to frame
    newStartTime = snapToFrame(newStartTime);
    const newEndTime = newStartTime + subtitleDuration;
    
    // Determine target track based on Y position
    const { currentProject } = useProjectStore.getState();
    if (!currentProject) return;
    
    const tracks = currentProject.tracks;
    const relativeY = e.clientY - containerRect.top - 40; // Account for ruler height
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

      updateSubtitle(subtitle.id, updates);
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
  }, [mouseDown, isDragging, dragStartPos, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame, duration, subtitle.id, setHighlightedIds]);

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

      const MIN_DURATION = (1000 / 30) * 2; // at least 2 frames (~67ms for 30fps)

      if (resizeSide === 'left') {
        newStart = snapToFrame(startTime + deltaTime);
        newStart = Math.max(0, Math.min(newStart, newEnd - MIN_DURATION));
      } else {
        newEnd = snapToFrame(endTime + deltaTime);
        newEnd = Math.max(newStart + MIN_DURATION, Math.min(newEnd, duration));
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
      updateSubtitle(subtitle.id, fullCover ? { startTime, endTime } : { startTime: newStart, endTime: newEnd });
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
  }, [resizeSide, isResizeInvalid, updateSubtitle]);

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

  return (
    <motion.div
      className="neu-subtitle-block absolute cursor-move"
      style={{
        left: left + (isDragging ? dragOffset.x : 0),
        width: Math.max(32, width),
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
      <div className="text-sm text-white font-semibold truncate">
        {subtitle.spans[0]?.text || 'Empty subtitle'}
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