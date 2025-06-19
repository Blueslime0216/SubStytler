import { useState } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

export const useTimelineInteraction = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  
  const { 
    viewStart, 
    viewEnd,
    setCurrentTime,
    snapToFrame
  } = useTimelineStore();

  const pixelToTime = (pixel: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return viewStart + (pixel / containerWidth) * viewDuration;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelToTime(x);
    
    setCurrentTime(snapToFrame(time));
    setIsDragging(true);
    setDragStart(x);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelToTime(x);
    
    setCurrentTime(snapToFrame(time));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};