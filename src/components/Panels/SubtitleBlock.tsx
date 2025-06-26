import React, { useRef, useCallback } from 'react';
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
  const dragStartData = useRef<{
    startTime: number;
    startX: number;
    startY: number;
    containerRect: DOMRect;
  } | null>(null);
  
  const { updateSubtitle } = useProjectStore();
  const { snapToFrame } = useTimelineStore();
  
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

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (isLocked) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', subtitle.id);
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    dragStartData.current = {
      startTime: subtitle.startTime,
      startX: e.clientX,
      startY: e.clientY,
      containerRect
    };
    
    onDragStart(subtitle.id, subtitle.trackId);
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = subtitle.spans[0]?.text || 'Subtitle';
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: linear-gradient(145deg, var(--neu-primary), var(--neu-primary-light));
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 15);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [isLocked, subtitle, containerRef, onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (isLocked || !dragStartData.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const { startTime, startX, startY, containerRect } = dragStartData.current;
    
    // Calculate new position based on mouse movement
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // Convert pixel movement to time
    const containerWidth = container.clientWidth;
    const { viewStart, viewEnd, duration } = useTimelineStore.getState();
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
    const relativeY = e.clientY - containerRect.top;
    const targetTrackIndex = Math.floor(relativeY / trackHeight);
    const targetTrack = tracks[targetTrackIndex];
    
    const updates: any = { 
      startTime: newStartTime, 
      endTime: newEndTime 
    };
    
    // Update track if valid and different
    if (targetTrack && targetTrack.id !== subtitle.trackId && !targetTrack.locked) {
      updates.trackId = targetTrack.id;
    }
    
    updateSubtitle(subtitle.id, updates);
    
    dragStartData.current = null;
    onDragEnd();
  }, [isLocked, subtitle, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame]);

  return (
    <motion.div
      className="neu-subtitle-block absolute cursor-move flex items-center px-4 neu-interactive"
      style={{
        left: Math.max(0, left),
        width: Math.max(32, width),
        top: '7px',
        height: '36px',
        opacity: isLocked ? 0.7 : 1,
        zIndex: 10
      }}
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Drag to move`}
      tabIndex={0}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 20 }}
    >
      <div className="text-sm text-white font-semibold truncate">
        {subtitle.spans[0]?.text || 'Empty subtitle'}
      </div>
    </motion.div>
  );
};

export default SubtitleBlock;