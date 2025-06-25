import React, { useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import TimelineToolbar from './TimelineToolbar';
import TimelineRuler from './TimelineRuler';
import SubtitleBlocks from './SubtitleBlocks';
import TimelineOverviewBar from './TimelineOverviewBar';

export const SubtitleTimelinePanel: React.FC = () => {
  const interactionRef = useRef<HTMLDivElement>(null);
  const {
    currentTime,
    duration,
    fps,
  } = useTimelineStore();
  const { currentProject, addSubtitle } = useProjectStore();

  const [zoom, setZoom] = React.useState(1);
  const [viewStart, setViewStart] = React.useState(0);
  const [viewEnd, setViewEnd] = React.useState(30000);

  const setViewRange = (s:number,e:number)=>{setViewStart(s);setViewEnd(e);};

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } = useTimelineInteraction(interactionRef, {
    zoom,
    setZoom,
    viewStart,
    viewEnd,
    setViewRange,
  });

  const timeToPixel = (time: number) => {
    if (!interactionRef.current) return 0;
    const containerWidth = interactionRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    if (viewDuration === 0) return 0;
    return ((time - viewStart) / viewDuration) * containerWidth;
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

  return (
    <div className="h-full flex flex-col neu-timeline">
      <TimelineToolbar onAddSubtitle={addNewSubtitle} zoom={zoom} setZoom={setZoom} viewStart={viewStart} viewEnd={viewEnd} setViewRange={setViewRange} duration={duration} />
      <div 
        ref={interactionRef}
        className="flex-1 flex flex-col relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop panning if mouse leaves
        onWheel={handleWheel}
      >
        <TimelineRuler
          viewStart={viewStart}
          viewEnd={viewEnd}
          fps={fps}
          timeToPixel={timeToPixel}
          containerWidth={interactionRef.current?.clientWidth || 0}
        />
        <div className="neu-timeline-track flex-1 relative overflow-hidden">
          <SubtitleBlocks
            subtitles={currentProject?.subtitles || []}
            currentTime={currentTime}
            timeToPixel={timeToPixel}
            // Pass interaction ref to subtitle blocks if they need to calculate position relative to it
            // but the interactions themselves are handled by the parent.
            containerRef={interactionRef} 
          />
        </div>
        <TimelineOverviewBar duration={duration} viewStart={viewStart} viewEnd={viewEnd} />
      </div>
    </div>
  );
};