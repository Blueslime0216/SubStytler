import React, { useState, useCallback, useRef } from 'react';
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
  const isPanningRef = useRef(false);
  const panStartXRef = useRef(0); // clientX where panning started
  const panStartViewRef = useRef(0); // viewStart at pan start

  // Cleanup refs to ensure we can remove listeners reliably
  const globalMoveRef = useRef<(e:MouseEvent)=>void>();
  const globalUpRef = useRef<(e:MouseEvent)=>void>();

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
      isPanningRef.current = true;
      panStartXRef.current = e.clientX;
      panStartViewRef.current = viewStart;

      // Attach global listeners so panning continues outside element
      const onMove = (ev: MouseEvent) => {
        if (!isPanningRef.current || !containerRef.current) return;

        const dx = ev.clientX - panStartXRef.current; // total movement since pan start

        const containerWidth = containerRef.current.clientWidth;
        const viewDuration = viewEnd - viewStart;
        const timeDelta = (dx / containerWidth) * viewDuration;

        let newStart = panStartViewRef.current - timeDelta;
        let newEnd = newStart + viewDuration;

        if (newStart < 0) {
          newStart = 0;
          newEnd = viewDuration;
        }
        if (newEnd > duration) {
          newEnd = duration;
          newStart = duration - viewDuration;
        }

        setViewRange(newStart, newEnd);
      };

      const onUp = (ev: MouseEvent) => {
        if (ev.button === 1) {
          setIsPanning(false);
          isPanningRef.current = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        }
      };

      globalMoveRef.current = onMove;
      globalUpRef.current = onUp;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
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
      // Prevent default to avoid text selection when panning inside element
      e.preventDefault();
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

    // Dynamic zoom factor based on current zoom level
    // Slower zooming at higher zoom levels for more precision
    const baseZoomFactor = 1.1;
    const zoomFactor = e.deltaY > 0 
      ? 1 / (baseZoomFactor - Math.min(0.05, zoom / 200)) // Zoom out
      : baseZoomFactor - Math.min(0.05, zoom / 200);      // Zoom in
    
    let newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
    
    // Enforce min/max zoom limits
    newZoom = Math.max(1, Math.min(100, newZoom));
    
    // Only update if zoom actually changed
    if (newZoom !== zoom) {
      setZoom(newZoom);
      
      // Calculate new view range centered on mouse position
      const newViewDuration = duration / newZoom;
      
      // Calculate ratio of mouse position in view
      const ratio = (timeAtCursor - viewStart) / (viewEnd - viewStart);
      
      // Apply the ratio to the new view duration
      let newStart = timeAtCursor - ratio * newViewDuration;
      let newEnd = newStart + newViewDuration;
      
      // Clamp to valid range
      if (newStart < 0) {
        newStart = 0;
        newEnd = newViewDuration;
      }
      if (newEnd > duration) {
        newEnd = duration;
        newStart = duration - newViewDuration;
      }
      
      setViewRange(newStart, newEnd);
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    timeToPixel,
    pixelToTime
  };
};