import React, { useState, useCallback } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

interface InteractionConfig {
  zoom: number;
  setZoom: (v:number)=>void;
  viewStart: number;
  viewEnd: number;
  setViewRange: (s:number,e:number)=>void;
}

export const useTimelineInteraction = (
  containerRef: React.RefObject<HTMLDivElement>,
  {zoom, setZoom, viewStart, viewEnd, setViewRange}: InteractionConfig
) => {
  const { duration, setCurrentTime, snapToFrame } = useTimelineStore();

  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const pixelToTime = useCallback((pixel: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    if (containerWidth === 0) return 0;
    const viewDuration = viewEnd - viewStart;
    return viewStart + (pixel / containerWidth) * viewDuration;
  }, [containerRef, viewStart, viewEnd]);
  
  const timeToPixel = useCallback((time: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    if (containerWidth === 0) return 0;
    const viewDuration = viewEnd - viewStart;
    if (viewDuration === 0) return 0;
    return ((time - viewStart) / viewDuration) * containerWidth;
  }, [containerRef, viewStart, viewEnd]);


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    if (e.button === 0 && containerRef.current) { // Left mouse button
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = pixelToTime(x);
      
      setCurrentTime(snapToFrame(time));
      // This part is for playhead dragging, which we can keep simple
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && containerRef.current) {
      const dx = e.clientX - dragStart.x;
      setDragStart({ x: e.clientX, y: e.clientY });

      const containerWidth = containerRef.current.clientWidth;
      const viewDuration = viewEnd - viewStart;
      const timeDelta = (dx / containerWidth) * viewDuration;

      const newStart = Math.max(0, viewStart - timeDelta);
      const newEnd = Math.min(duration, newStart + viewDuration);
      
      setViewRange(newEnd - viewDuration, newEnd);
      return;
    }
    
    // For playhead dragging, if needed
    if (e.buttons === 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const time = pixelToTime(x);
      setCurrentTime(snapToFrame(time));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsPanning(false);
      e.preventDefault();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const timeAtCursor = pixelToTime(mouseX);

    // Always zoom with wheel
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    setZoom(newZoom);

    const newViewDuration = duration / newZoom;
    
    let newStart = timeAtCursor - (mouseX / rect.width) * newViewDuration;
    let newEnd = newStart + newViewDuration;

    if (newStart < 0) {
      newStart = 0;
      newEnd = newViewDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - newViewDuration;
    }
    
    setViewRange(Math.max(0, newStart), Math.min(duration, newEnd));
  };

  // We are not handling subtitle block dragging here, so isDragging state is local
  // The panel component will need to handle its own dragging state if it wants to drag blocks
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  };
};