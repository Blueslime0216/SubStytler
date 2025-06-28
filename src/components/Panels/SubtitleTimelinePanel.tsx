import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import TimelineToolbar from './TimelineToolbar';
import TimelineOverviewBar from './TimelineOverviewBar';
import { useHotkeys } from 'react-hotkeys-hook';
import TracksContainer from './TracksContainer';
import { SubtitleTrack } from '../../types/project';
import { useSelectedTrackStore } from '../../stores/selectedTrackStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../../stores/subtitleHighlightStore';
import { useHistoryStore } from '../../stores/historyStore';

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
  const { currentProject, addSubtitle, addTrack, deleteSubtitle } = useProjectStore();
  const { selectedTrackId, setSelectedTrackId } = useSelectedTrackStore();
  const { selectedSubtitleId, setSelectedSubtitleId } = useSelectedSubtitleStore();
  const { flashIds } = useSubtitleHighlightStore();

  // Local state for this panel instance
  const [localZoom, setLocalZoom] = useState(globalZoom);
  const [localViewStart, setLocalViewStart] = useState(globalViewStart);
  const [localViewEnd, setLocalViewEnd] = useState(globalViewEnd);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track mouse hover to activate hotkey only when timeline is under cursor
  const [isHovered, setIsHovered] = useState(false);

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
      // 🆕 Record state before adding subtitle
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before adding new subtitle',
        true // Mark as internal
      );
      
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
          detail: '',
          locked: false,
          visible: true
        };
        // Add to project store directly (simpler than creating action) – fallback
        currentProject.tracks.push(defaultTrack);
        targetTrackId = newTrackId;
      }

      // Check if the target track is locked before proceeding
      const targetTrack = currentProject.tracks.find(track => track.id === targetTrackId);
      if (targetTrack?.locked) {
        console.warn(`Cannot add subtitle to a locked track: "${targetTrack.name}"`);
        // A user-facing notification like a toast could be added here for better UX.
        return;
      }

      // 1) Check overlap on target track at currentTime
      const newStartTime = currentTime;
      const newEndTime = currentTime + 2000; // Default duration is 2s

      const overlapping = currentProject.subtitles.find(
        (sub) =>
          sub.trackId === targetTrackId && // Same track
          newStartTime < sub.endTime &&   // New sub starts before other ends
          newEndTime > sub.startTime      // New sub ends after other starts
      );

      if (overlapping) {
        // Flash highlight and select the subtitle
        flashIds([overlapping.id], 600);
        return; // do not add new subtitle
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
      setSelectedSubtitleId(newSubtitle.id);
      
      // 🆕 Record state after adding subtitle
      setTimeout(() => {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId: newSubtitle.id
              }
            },
            `Added new subtitle at ${formatTimeForHistory(currentTime)}`
          );
        }
      }, 0);
    }
  };

  // Hotkey: Shift + A to add a subtitle at playhead when timeline is hovered
  useHotkeys('shift+a', (e) => {
    if (!isHovered) return;
    e.preventDefault();
    addNewSubtitle();
  }, { enabled: isHovered, enableOnFormTags: true }, [isHovered, addNewSubtitle]);

  // Hotkey: Delete or Backspace to remove selected subtitle when timeline is hovered
  useHotkeys('delete,backspace', (e) => {
    if (!isHovered || !selectedSubtitleId) return;
    e.preventDefault();
    
    // 🆕 Record state before deleting
    const { currentProject } = useProjectStore.getState();
    if (currentProject) {
      const subtitleToDelete = currentProject.subtitles.find(s => s.id === selectedSubtitleId);
      if (!subtitleToDelete) return;
      
      useHistoryStore.getState().record(
        { 
          project: {
            subtitles: [...currentProject.subtitles],
            selectedSubtitleId
          }
        },
        'Before deleting subtitle with hotkey',
        true // Mark as internal
      );
      
      deleteSubtitle(selectedSubtitleId);
      setSelectedSubtitleId(null);
      
      // 🆕 Record state after deleting
      setTimeout(() => {
        const { currentProject } = useProjectStore.getState();
        if (currentProject) {
          useHistoryStore.getState().record(
            { 
              project: {
                subtitles: currentProject.subtitles,
                selectedSubtitleId: null
              }
            },
            `Deleted subtitle at ${formatTimeForHistory(subtitleToDelete.startTime)} with hotkey`
          );
        }
      }, 0);
    }
  }, { enabled: isHovered, enableOnFormTags: false }, [isHovered, selectedSubtitleId, deleteSubtitle]);

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

  const handleAddTrack = () => {
    const tracks = currentProject?.tracks || [];
    const trackNumber = tracks.length + 1;
    const trackId = addTrack(`Track ${trackNumber}`);
    if (trackId) {
      setSelectedTrackId(trackId);
    }
  };

  return (
    <div className="h-full flex flex-col neu-timeline" style={{ overflow: 'hidden' }}>
      <TimelineToolbar 
        onAddSubtitle={addNewSubtitle} 
        onAddTrack={handleAddTrack}
        zoom={localZoom} 
        setZoom={setZoom as any} 
        viewStart={localViewStart} 
        viewEnd={localViewEnd} 
        setViewRange={setViewRange} 
        duration={duration} 
      />
      <div className="flex-1 flex flex-col relative" style={{ minHeight: 0, overflow: 'hidden' }}>
        <div className="flex-1 relative" style={{ minHeight: 0, overflow: 'hidden' }}>
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
            onSidebarWidthChange={setSidebarWidth}
          />
        </div>
        
        <TimelineOverviewBar
          duration={duration}
          viewStart={localViewStart}
          viewEnd={localViewEnd}
          zoom={localZoom}
          setZoom={setZoom as any}
          setViewRange={setViewRange}
          sidebarOffset={sidebarWidth}
        />
      </div>
    </div>
  );
};

// Helper function to format time for history descriptions
function formatTimeForHistory(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}