import React, { useRef, useCallback, useEffect } from 'react';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../../../stores/subtitleHighlightStore';
import { SubtitleBlockProps } from './SubtitleBlockTypes';
import { useSubtitleDrag } from './useSubtitleDrag';
import { useSubtitleResize } from './useSubtitleResize';
import { SubtitleBlockView } from './SubtitleBlockView';
import { useTimelineStore } from '../../../stores/timelineStore';

const SubtitleBlock: React.FC<SubtitleBlockProps> = ({
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
  const { selectedSubtitleId, setSelectedSubtitleId } = useSelectedSubtitleStore();
  const { highlightedIds } = useSubtitleHighlightStore();
  const { duration } = useTimelineStore();
  
  // Selected state
  const isSelected = selectedSubtitleId === subtitle.id;
  const isHighlighted = highlightedIds.has(subtitle.id);
  
  // Calculate position and dimensions
  const left = timeToPixel(subtitle.startTime);
  const width = timeToPixel(subtitle.endTime) - left;
  
  // Determine visibility without causing early hook-return
  const containerWidth = containerRef.current?.clientWidth || 0;
  const BUFFER = 100; // px to allow block (and shadow) partially outside before hiding
  const isOutsideView =
    !containerRef.current || left + width < -BUFFER || left > containerWidth + BUFFER;

  // Drag functionality
  const {
    isDragging,
    isDropInvalid,
    dragOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    mouseDown,
    setMouseDown
  } = useSubtitleDrag(
    subtitle,
    containerRef,
    onDragStart,
    onDragEnd,
    trackIndex,
    trackHeight
  );

  // Resize functionality
  const {
    resizeSide,
    isResizeInvalid,
    startResize,
    handleResizeMove,
    handleResizeUp
  } = useSubtitleResize(
    subtitle,
    containerRef,
    duration
  );

  // Click to select (only when not dragging)
  const handleClick = useCallback(() => {
    if (isDragging) return;
    setSelectedSubtitleId(subtitle.id);
  }, [isDragging, setSelectedSubtitleId, subtitle.id]);

  // Global mouse event listeners
  useEffect(() => {
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

  // If the block is outside of the current viewport, render nothing after all hooks have been invoked
  if (isOutsideView) {
    return null;
  }

  // Calculate the display width - ensure it's never negative
  const displayWidth = Math.max(1, width);

  return (
    <SubtitleBlockView
      subtitle={subtitle}
      timeToPixel={timeToPixel}
      pixelToTime={pixelToTime}
      containerRef={containerRef}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isLocked={isLocked}
      trackIndex={trackIndex}
      trackHeight={trackHeight}
      left={left}
      displayWidth={displayWidth}
      isDragging={isDragging}
      isDropInvalid={isDropInvalid}
      isResizeInvalid={isResizeInvalid}
      dragOffset={dragOffset}
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      handleMouseDown={handleMouseDown}
      handleClick={handleClick}
      startResize={startResize}
    />
  );
};

export default SubtitleBlock;