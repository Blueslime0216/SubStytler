import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
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

  const dragThreshold = 4; // px

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    
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
  }, [mouseDown, isDragging, dragStartPos, trackHeight, trackIndex, subtitle.id, subtitle.trackId, onDragStart]);

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
    
    const updates: any = { 
      startTime: newStartTime, 
      endTime: newEndTime 
    };
    
    // Update track if valid and different
    if (targetTrack && targetTrack.id !== originalTrackId && !targetTrack.locked) {
      updates.trackId = targetTrack.id;
    }
    
    updateSubtitle(subtitle.id, updates);
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    dragStartData.current = null;
    setMouseDown(false);
    onDragEnd();
  }, [mouseDown, isDragging, dragStartPos, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame, duration, subtitle.id]);

  // Click to select (only when not dragging)
  const handleClick = useCallback(() => {
    if (isDragging) return;
    setSelectedSubtitleId(subtitle.id);
  }, [isDragging, setSelectedSubtitleId, subtitle.id]);

  // Global mouse event listeners
  React.useEffect(() => {
    if (mouseDown) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [mouseDown, handleMouseMove, handleMouseUp]);

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
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        pointerEvents: isDragging ? 'none' : 'auto',
        outline: isSelected ? '2px solid var(--highlight-color)' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Drag to move`}
      tabIndex={0}
      animate={{
        scale: isDragging ? 1.05 : 1,
        boxShadow: isDragging 
          ? '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(99, 179, 237, 0.5)'
          : 'var(--neu-shadow-2), 0 0 8px rgba(99, 179, 237, 0.3)'
      }}
      transition={{ duration: 0.1 }}
    >
      <div className="text-sm text-white font-semibold truncate">
        {subtitle.spans[0]?.text || 'Empty subtitle'}
      </div>
      
      {/* Visual indicator when dragging */}
      {isDragging && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-400 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
};

export default SubtitleBlock;