import { useState, useRef, useCallback } from 'react';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useProjectStore } from '../../../stores/projectStore';
import { useSubtitleHighlightStore } from '../../../stores/subtitleHighlightStore';
import { useHistoryStore } from '../../../stores/historyStore';
import { DragStartData } from './SubtitleBlockTypes';

export const useSubtitleDrag = (
  subtitle: any,
  containerRef: React.RefObject<HTMLDivElement>,
  onDragStart: (subtitleId: string, trackId: string) => void,
  onDragEnd: () => void,
  trackIndex: number,
  trackHeight: number
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [isDropInvalid, setIsDropInvalid] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const dragStartData = useRef<DragStartData | null>(null);
  
  const { updateSubtitle } = useProjectStore();
  const { snapToFrame, duration } = useTimelineStore();
  const { setHighlightedIds } = useSubtitleHighlightStore();
  
  // Flag to track if we've already recorded the initial state for this operation
  const hasRecordedInitialState = useRef<boolean>(false);
  
  const subtitleDuration = subtitle.endTime - subtitle.startTime;

  // Record initial state before drag
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
      'Before moving subtitle',
      true // Mark as internal
    );
    
    // Set flag to prevent duplicate recordings
    hasRecordedInitialState.current = true;
  }, [subtitle.id]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
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
  }, [subtitle, containerRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseDown || !dragStartData.current) return;

    const deltaXFromStart = e.clientX - dragStartPos.x;
    const deltaYFromStart = e.clientY - dragStartPos.y;

    // If drag not started yet, check threshold
    if (!isDragging) {
      const dragThreshold = 4; // px
      if (Math.abs(deltaXFromStart) < dragThreshold && Math.abs(deltaYFromStart) < dragThreshold) {
        return; // still a click
      }

      // Start drag
      setIsDragging(true);
      onDragStart(subtitle.id, subtitle.trackId);
      
      // Record initial state for undo
      recordInitialState();
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
  }, [mouseDown, isDragging, dragStartPos, trackHeight, trackIndex, subtitle.id, subtitle.trackId, onDragStart, duration, subtitleDuration, setHighlightedIds, recordInitialState]);

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

      updateSubtitle(subtitle.id, updates, false);
      
      // Record final state for redo
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
                selectedSubtitleId: subtitle.id
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
    
    // Reset the initial state recording flag
    hasRecordedInitialState.current = false;
  }, [mouseDown, isDragging, dragStartPos, containerRef, updateSubtitle, onDragEnd, subtitleDuration, trackHeight, snapToFrame, duration, subtitle.id, setHighlightedIds]);

  return {
    isDragging,
    isDropInvalid,
    dragOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    mouseDown,
    setMouseDown
  };
};