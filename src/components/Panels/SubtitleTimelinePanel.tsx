import React, { useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import TimelineToolbar from './TimelineToolbar';
import TimelineRuler from './TimelineRuler';
import SubtitleBlocks from './SubtitleBlocks';

export const SubtitleTimelinePanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    currentTime,
    duration,
    fps,
    zoom,
    viewStart,
    viewEnd,
    setZoom,
    setViewRange,
  } = useTimelineStore();
  const { currentProject, addSubtitle } = useProjectStore();
  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useTimelineInteraction(containerRef);

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.5 : zoom / 1.5;
    setZoom(newZoom);
    const center = currentTime;
    const currentViewDuration = viewEnd - viewStart;
    const newViewDuration = currentViewDuration / (direction === 'in' ? 1.5 : 1 / 1.5);
    const newStart = Math.max(0, center - newViewDuration / 2);
    const newEnd = Math.min(duration, center + newViewDuration / 2);
    setViewRange(newStart, newEnd);
  };

  const addNewSubtitle = () => {
    if (currentProject) {
      const newSubtitle = {
        id: crypto.randomUUID(),
        spans: [{
          id: crypto.randomUUID(),
          text: 'New subtitle',
          startTime: currentTime,
          endTime: currentTime + 2000
        }],
        startTime: currentTime,
        endTime: currentTime + 2000,
        trackId: 'default'
      };
      addSubtitle(newSubtitle);
    }
  };

  const timeToPixel = (time: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return ((time - viewStart) / viewDuration) * containerWidth;
  };

  return (
    <div className="h-full flex flex-col neu-timeline">
      <TimelineToolbar onAddSubtitle={addNewSubtitle} onZoom={handleZoom} zoom={zoom} />
      <div className="flex-1 flex flex-col">
        <TimelineRuler
          viewStart={viewStart}
          viewEnd={viewEnd}
          fps={fps}
          timeToPixel={timeToPixel}
          containerWidth={containerRef.current?.clientWidth || 0}
        />
        <div className="neu-timeline-track flex-1 relative overflow-hidden">
          <SubtitleBlocks
            subtitles={currentProject?.subtitles || []}
            currentTime={currentTime}
            timeToPixel={timeToPixel}
            containerRef={containerRef}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
};