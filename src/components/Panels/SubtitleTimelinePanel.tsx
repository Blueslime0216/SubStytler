import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import TimelineToolbar from './TimelineToolbar';
import TimelineOverviewBar from './TimelineOverviewBar';
import { useHotkeys } from 'react-hotkeys-hook';
import TracksContainer from './TracksContainer';
import { SubtitleTrack } from '../../types/project';

export const SubtitleTimelinePanel: React.FC = () => {
  const interactionRef = useRef<HTMLDivElement>(null);
  const {
    currentTime,
    duration,
    fps,
    zoom: globalZoom,
    viewStart: globalViewStart,
    viewEnd: globalViewEnd,
    setZoom: setGlobalZoom,
    setViewRange: setGlobalViewRange,
  } = useTimelineStore();
  const { currentProject, addSubtitle } = useProjectStore();

  // Local state for this panel instance
  const [localZoom, setLocalZoom] = useState(globalZoom);
  const [localViewStart, setLocalViewStart] = useState(globalViewStart);
  const [localViewEnd, setLocalViewEnd] = useState(globalViewEnd);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track mouse hover to activate hotkey only when timeline is under cursor
  const [isHovered, setIsHovered] = useState(false);

  // Currently selected track id (updated by TracksContainer)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(180);

  // Sync local state with global state on mount and when global state changes
  useEffect(() => {
    if (!isInitialized) {
      setLocalZoom(globalZoom);
      setLocalViewStart(globalViewStart);
      setLocalViewEnd(globalViewEnd);
      setIsInitialized(true);
    }
  }, [globalZoom, globalViewStart, globalViewEnd, isInitialized]);

  // Update global state when local state changes
  const setViewRange = (s: number, e: number) => {
    setLocalViewStart(s);
    setLocalViewEnd(e);
    setGlobalViewRange(s, e);
  };

  const setZoom = (z: number) => {
    setLocalZoom(z);
    setGlobalZoom(z);
  };

  const addNewSubtitle = () => {
    if (currentProject) {
      // Determine target track: selected, else first, else default
      let targetTrackId: string;
      if (selectedTrackId) {
        targetTrackId = selectedTrackId;
      } else if (currentProject.tracks.length > 0) {
        targetTrackId = currentProject.tracks[0].id;
      } else {
        // If no track exists, create one automatically
        const newTrackId = crypto.randomUUID();
        const defaultTrack: SubtitleTrack = {
          id: newTrackId,
          name: 'Default',
          language: 'und',
          locked: false,
          visible: true
        };
        // Add to project store directly (simpler than creating action) – fallback
        currentProject.tracks.push(defaultTrack);
        targetTrackId = newTrackId;
      }

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
        trackId: targetTrackId
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
  useLayoutEffect(() => {
    if (!interactionRef.current || !isInitialized) return;

    // If zoom === 1 we always want to cover the full duration.
    if (localZoom === 1) {
      setViewRange(0, duration);
      return;
    }

    // Otherwise, make sure the view window fits inside the new duration.
    const viewDuration = localViewEnd - localViewStart;
    if (localViewEnd > duration) {
      const newEnd = duration;
      const newStart = Math.max(0, newEnd - viewDuration);
      setViewRange(newStart, newEnd);
    }
  }, [duration, localZoom, localViewEnd, localViewStart, isInitialized]);

  return (
    <div className="h-full flex flex-col neu-timeline" style={{ overflow: 'visible' }}>
      <TimelineToolbar 
        onAddSubtitle={addNewSubtitle} 
        zoom={localZoom} 
        setZoom={setZoom as any} 
        viewStart={localViewStart} 
        viewEnd={localViewEnd} 
        setViewRange={setViewRange} 
        duration={duration} 
      />
      <div className="flex-1 flex flex-col relative" style={{ minHeight: 0, overflow: 'visible' }}>
        <div className="flex-1 relative" style={{ minHeight: 0, overflow: 'visible' }}>
          <TracksContainer 
            currentTime={currentTime}
            containerRef={interactionRef}
            viewStart={localViewStart}
            viewEnd={localViewEnd}
            fps={fps}
            zoom={localZoom}
            setZoom={setZoom as any}
            setViewRange={setViewRange}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            selectedTrackId={selectedTrackId}
            setSelectedTrackId={setSelectedTrackId}
            onSidebarWidthChange={setSidebarWidth}
          />
        </div>
        
        <TimelineOverviewBar
          duration={duration}
          viewStart={localViewStart}
          viewEnd={localViewEnd}
          sidebarOffset={sidebarWidth}
        />
      </div>
    </div>
  );
};