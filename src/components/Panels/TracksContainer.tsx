import React, { useState, useCallback, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import TrackHeader from './TrackHeader';
import SubtitleBlock from './SubtitleBlock';
import TimelineRuler from './TimelineRuler';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import { Plus } from 'lucide-react';

interface TracksContainerProps {
  currentTime: number;
  containerRef: React.RefObject<HTMLDivElement>;
  viewStart: number;
  viewEnd: number;
  fps: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setViewRange: (s: number, e: number) => void;
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTrackId: string | null;
  setSelectedTrackId: React.Dispatch<React.SetStateAction<string | null>>;
  onSidebarWidthChange?: (width: number) => void;
}

export const TracksContainer: React.FC<TracksContainerProps> = ({
  currentTime,
  containerRef,
  viewStart,
  viewEnd,
  fps,
  zoom,
  setZoom,
  setViewRange,
  isHovered,
  setIsHovered,
  selectedTrackId,
  setSelectedTrackId,
  onSidebarWidthChange
}) => {
  const {
    currentProject,
    addTrack,
    updateTrack,
    deleteTrack,
    updateSubtitle
  } = useProjectStore();
  
  const [draggedSubtitle, setDraggedSubtitle] = useState<{ id: string, sourceTrackId: string } | null>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);
  const [hasLeftOriginalTrack, setHasLeftOriginalTrack] = useState(false);

  const tracks = currentProject?.tracks || [];
  const subtitles = currentProject?.subtitles || [];

  // Interaction handling (pan/zoom/playhead)
  const { handleMouseDown: tMouseDown, handleMouseMove: tMouseMove, handleMouseUp: tMouseUp, handleWheel: tWheel } = useTimelineInteraction(containerRef, {
    zoom,
    setZoom,
    viewStart,
    viewEnd,
    setViewRange,
  });

  // Wrap interaction handlers so they are disabled while resizing sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizingRef.current) return;
    tMouseDown(e);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizingRef.current) return;
    tMouseMove(e);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isResizingRef.current) return;
    tMouseUp(e);
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (isResizingRef.current) return;
    tWheel(e);
  };

  // Improved time/pixel conversion functions
  const timeToPixel = useCallback((time: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    if (viewDuration === 0) return 0;
    return ((time - viewStart) / viewDuration) * width;
  }, [viewStart, viewEnd, containerRef]);

  const pixelToTime = useCallback((pixel: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return viewStart + (pixel / width) * viewDuration;
  }, [viewStart, viewEnd, containerRef]);

  const handleAddTrack = () => {
    const trackNumber = tracks.length + 1;
    const trackId = addTrack(`Track ${trackNumber}`);
    if (trackId) {
      setSelectedTrackId(trackId);
    }
  };

  const handleSubtitleDragStart = useCallback((subtitleId: string, trackId: string) => {
    setDraggedSubtitle({ id: subtitleId, sourceTrackId: trackId });
    setHasLeftOriginalTrack(false);
  }, []);

  const handleSubtitleDragEnd = useCallback(() => {
    setDraggedSubtitle(null);
    setDragOverTrackId(null);
    setHasLeftOriginalTrack(false);
  }, []);

  // Track hover detection for visual feedback during drag
  const handleTrackMouseEnter = useCallback((trackId: string) => {
    if (!draggedSubtitle) return;

    if (!hasLeftOriginalTrack) {
      // First time leaving original track
      if (trackId !== draggedSubtitle.sourceTrackId) {
        setHasLeftOriginalTrack(true);
        setDragOverTrackId(trackId);
      }
    } else {
      // Already left once, highlight any track we enter (including origin)
      setDragOverTrackId(trackId);
    }
  }, [draggedSubtitle, hasLeftOriginalTrack]);

  const handleTrackMouseLeave = useCallback(() => {
    setDragOverTrackId(null);
  }, []);

  const RULER_HEIGHT = 40;
  const TRACK_HEIGHT = 50;

  // Sidebar width state for resizable track header
  const [sidebarWidth, setSidebarWidth] = useState(180);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(180);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      let newW = startWidthRef.current + delta;
      const min = 120;
      const max = 400;
      newW = Math.max(min, Math.min(max, newW));
      setSidebarWidth(newW);
    };
    const stop = () => { isResizingRef.current = false; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
    };
  }, []);

  /* ------------------------------------------------------------------
     Scroll Sync between Track Header (left) and Track Content (right)
     ------------------------------------------------------------------ */
  const headerRef = useRef<HTMLDivElement>(null);

  const syncHeaderScroll = React.useCallback(() => {
    if (!headerRef.current || !containerRef.current) return;
    headerRef.current.scrollTop = containerRef.current.scrollTop;
  }, [headerRef, containerRef]);

  // When header is scrolled (e.g., via mouse wheel), sync content
  const handleHeaderScroll = React.useCallback(() => {
    if (!headerRef.current || !containerRef.current) return;
    containerRef.current.scrollTop = headerRef.current.scrollTop;
  }, [headerRef, containerRef]);

  const handleContentScroll = React.useCallback(() => {
    syncHeaderScroll();
  }, [syncHeaderScroll]);

  // Notify parent of sidebar width changes
  React.useEffect(() => {
    if (typeof onSidebarWidthChange === 'function') {
      onSidebarWidthChange(sidebarWidth);
    }
  }, [sidebarWidth, onSidebarWidthChange]);

  return (
    <div className="neu-tracks-container">
      {/* Track headers */}
      <div
        className="neu-tracks-header"
        style={{ 
          width: sidebarWidth,
          maxHeight: '100%', // ✅ Ensure proper height constraint
          overflowY: 'auto', // ✅ Enable scrolling
          overflowX: 'hidden' // ✅ Hide horizontal scroll
        }}
        ref={headerRef}
        onScroll={handleHeaderScroll}
      >
        {/* Spacer to align with Ruler */}
        <div style={{ height: RULER_HEIGHT, flexShrink: 0 }} />

        {tracks.map((track) => (
          <TrackHeader
            key={track.id}
            track={track}
            isActive={selectedTrackId === track.id}
            onDelete={deleteTrack}
            onRename={(id, name) => updateTrack(id, { name })}
            onToggleVisibility={(id, visible) => updateTrack(id, { visible })}
            onToggleLock={(id, locked) => updateTrack(id, { locked })}
          />
        ))}

        {/* Redesigned Add Track Button */}
        <div className="neu-track-add" onClick={handleAddTrack} title="Add new track">
          <div className="track-add-content">
            <div className="track-add-icon">
              <Plus className="w-3 h-3" />
            </div>
            <span className="track-add-text">Add Track</span>
          </div>
        </div>
      </div>

      {/* Resize handle */}
      <div className="neu-track-resize-handle" onMouseDown={handleResizeMouseDown} />

      {/* Right side: Ruler + tracks content */}
      <div 
        className="neu-tracks-content flex-1 flex flex-col relative"
        style={{
          maxHeight: '100%', // ✅ Ensure proper height constraint
          overflowY: 'auto', // ✅ Enable scrolling
          overflowX: 'hidden' // ✅ Hide horizontal scroll
        }}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); }}
        onWheel={handleWheel}
        onScroll={handleContentScroll}
      >
        <TimelineRuler
          viewStart={viewStart}
          viewEnd={viewEnd}
          fps={fps}
          timeToPixel={timeToPixel}
          containerWidth={containerRef.current?.clientWidth || 0}
        />

        {tracks.map((track, trackIndex) => (
          <div
            key={track.id}
            className={`neu-track-content ${track.locked ? 'opacity-70' : ''} ${
              dragOverTrackId === track.id ? 'bg-blue-500 bg-opacity-20' : ''
            }`}
            style={{ 
              height: TRACK_HEIGHT,
              flexShrink: 0 // ✅ Prevent track height from shrinking
            }}
            onClick={() => setSelectedTrackId(track.id)}
            onMouseEnter={() => handleTrackMouseEnter(track.id)}
            onMouseLeave={handleTrackMouseLeave}
          >
            {/* Render subtitles for this track */}
            {subtitles
              .filter((subtitle) => subtitle.trackId === track.id && track.visible)
              .map((subtitle) => (
                <SubtitleBlock
                  key={subtitle.id}
                  subtitle={subtitle}
                  timeToPixel={timeToPixel}
                  pixelToTime={pixelToTime}
                  containerRef={containerRef}
                  onDragStart={handleSubtitleDragStart}
                  onDragEnd={handleSubtitleDragEnd}
                  isLocked={track.locked}
                  trackIndex={trackIndex}
                  trackHeight={TRACK_HEIGHT}
                />
              ))}
          </div>
        ))}

        {/* Redesigned Playhead */}
        <div
          className="neu-playhead"
          style={{
            left: timeToPixel(currentTime),
          }}
        />
      </div>
    </div>
  );
};

export default TracksContainer;