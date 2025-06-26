import React, { useRef, useLayoutEffect, useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import TimelineToolbar from './TimelineToolbar';
import TimelineOverviewBar from './TimelineOverviewBar';
import { useHotkeys } from 'react-hotkeys-hook';
import TracksContainer from './TracksContainer';

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
  const [viewEnd, setViewEnd] = React.useState(60000);

  // Track mouse hover to activate hotkey only when timeline is under cursor
  const [isHovered, setIsHovered] = useState(false);

  const setViewRange = (s:number,e:number)=>{setViewStart(s);setViewEnd(e);};

  const addNewSubtitle = () => {
    if (currentProject) {
      // Use the first available track, or 'default' if none
      const firstTrackId = currentProject.tracks.length > 0 
        ? currentProject.tracks[0].id 
        : 'default';
      
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
        trackId: firstTrackId
      };
      addSubtitle(newSubtitle);
    }
  };

  // Hotkey: Shift + A to add a subtitle at playhead when timeline is hovered
  useHotkeys('shift+a', (e) => {
    if (!isHovered) return;
    e.preventDefault();
    addNewSubtitle();
  }, { enabled: isHovered, enableOnFormTags: true }, [isHovered, addNewSubtitle]);

  // Keep the local view window in sync with the overall project duration.
  //  • On first mount we align to the current store duration (60 s by default).
  //  • When a video is uploaded (or removed) and the duration changes, we
  //    extend/clamp the view range so that existing subtitles stay visible.
  useLayoutEffect(() => {
    if (!interactionRef.current) return;

    // If zoom === 1 we always want to cover the full duration.
    if (zoom === 1) {
      setViewRange(0, duration);
      return;
    }

    // Otherwise, make sure the view window fits inside the new duration.
    const viewDuration = viewEnd - viewStart;
    if (viewEnd > duration) {
      const newEnd = duration;
      const newStart = Math.max(0, newEnd - viewDuration);
      setViewRange(newStart, newEnd);
    }
  }, [duration, zoom, viewEnd, viewStart]);

  return (
    <div className="h-full flex flex-col neu-timeline">
      <TimelineToolbar 
        onAddSubtitle={addNewSubtitle} 
        zoom={zoom} 
        setZoom={setZoom} 
        viewStart={viewStart} 
        viewEnd={viewEnd} 
        setViewRange={setViewRange} 
        duration={duration} 
      />
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          <TracksContainer 
            currentTime={currentTime}
            containerRef={interactionRef}
            viewStart={viewStart}
            viewEnd={viewEnd}
            fps={fps}
            zoom={zoom}
            setZoom={setZoom}
            setViewRange={setViewRange}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
          />
        </div>
        
        <TimelineOverviewBar duration={duration} viewStart={viewStart} viewEnd={viewEnd} />
      </div>
    </div>
  );
};