import React, { useRef, useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

interface Props {
  duration: number;
  viewStart: number;
  viewEnd: number;
  zoom: number;
  setZoom: (z:number)=>void;
  setViewRange: (s:number,e:number)=>void;
  sidebarOffset?: number; // pixels to offset from left (track header width)
}

const TimelineOverviewBar: React.FC<Props> = ({ 
  duration, 
  viewStart, 
  viewEnd, 
  zoom, 
  setZoom, 
  setViewRange, 
  sidebarOffset = 0 
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0); // clientX at drag start
  const dragStartViewRef = useRef(0); // viewStart at drag start
  const { getMaxZoom } = useTimelineStore();

  if (duration === 0) return null;

  const viewDuration = viewEnd - viewStart;

  const percentToTime = (percent: number) => (percent / 100) * duration;
  const pixelToTime = (pixel: number) => {
    if (!barRef.current) return 0;
    const width = barRef.current.clientWidth;
    return percentToTime((pixel / width) * 100);
  };

  const startPercent = (viewStart / duration) * 100;
  const widthPercent = (viewDuration / duration) * 100;

  const clampRange = (s:number,e:number)=>{
    if(s<0){e-=s;s=0;}
    if(e>duration){s-=e-duration;e=duration;}
    return [Math.max(0,s),Math.min(duration,e)];
  };

  const CLICK_THRESHOLD = 3; // px

  const handleBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return; // middle button only
    e.preventDefault();

    // 1. 클릭 순간 해당 위치로 이동
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const timeAtClick = pixelToTime(x);
      let newStart = timeAtClick - viewDuration / 2;
      let newEnd = newStart + viewDuration;
      [newStart, newEnd] = clampRange(newStart, newEnd);
      setViewRange(newStart, newEnd);
      dragStartViewRef.current = newStart;
    } else {
      dragStartViewRef.current = viewStart;
    }
    dragStartXRef.current = e.clientX;
    isDraggingRef.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !barRef.current) return;
      const dx = ev.clientX - dragStartXRef.current;

      const width = barRef.current.clientWidth;
      const timeDelta = (dx / width) * duration;

      let newStart = dragStartViewRef.current + timeDelta;
      let newEnd = newStart + viewDuration;
      [newStart, newEnd] = clampRange(newStart, newEnd);
      setViewRange(newStart, newEnd);
    };

    const onUp = (ev: MouseEvent) => {
      if (ev.button === 1) {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if(e.cancelable) e.preventDefault();
    if(!barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeAtCursor = pixelToTime(x);

    // Calculate max zoom based on current container width
    const maxZoom = getMaxZoom(rect.width);
    
    const zoomFactor = 1.1;
    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.max(1, Math.min(maxZoom, newZoom));
    setZoom(newZoom);

    const newViewDuration = duration / newZoom;
    let newStart = timeAtCursor - (x / rect.width) * newViewDuration;
    let newEnd = newStart + newViewDuration;
    [newStart,newEnd]=clampRange(newStart,newEnd);
    setViewRange(newStart,newEnd);
  };

  return (
    <div
      className="timeline-overview-bar-bg"
      style={{ marginLeft: sidebarOffset, width: `calc(100% - ${sidebarOffset}px)` }}
      ref={barRef}
      onMouseDown={handleBarMouseDown}
      onWheel={handleWheel}
      role="presentation"
    >
      <div
        className="timeline-overview-bar-window"
        style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
      />
    </div>
  );
};

export default TimelineOverviewBar;