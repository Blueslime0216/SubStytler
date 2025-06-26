import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
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
  
  const left = timeToPixel(subtitle.startTime);
  const width = timeToPixel(subtitle.endTime) - left;
  
  // Don't render if outside visible area
  if (!containerRef.current || left + width < 0) {
    return null;
  }

  const containerWidth = containerRef.current?.clientWidth || 0;
  if (left > containerWidth) {
    return null;
  }

  const subtitleDuration = subtitle.endTime - subtitle.startTime;

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
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    onDragStart(subtitle.id, subtitle.trackId);
  }, [isLocked, subtitle, containerRef, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartData.current) return;
    
    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  }, [isDragging, dragStartPos]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartData.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
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
    onDragEnd();
  }, [isDragging, dragStartPos, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame, duration, subtitle.id]);

  // Global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      className="neu-subtitle-block absolute cursor-move flex items-center px-4 neu-interactive"
      style={{
        left: Math.max(0, left + (isDragging ? dragOffset.x : 0)),
        width: Math.max(32, width),
        top: `${7 + (isDragging ? dragOffset.y : 0)}px`,
        height: '36px',
        opacity: isLocked ? 0.7 : 1,
        zIndex: isDragging ? 1000 : 10,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
      onMouseDown={handleMouseDown}
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