import React, { useState, useCallback, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import TrackHeader from './TrackHeader';
import SubtitleBlock from './SubtitleBlock';
import TimelineRuler from './TimelineRuler';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import { Plus } from 'lucide-react';
import { useSelectedTrackStore } from '../../stores/selectedTrackStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';

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

  const { selectedTrackId, setSelectedTrackId } = useSelectedTrackStore();
  const { setSelectedSubtitleId } = useSelectedSubtitleStore();

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

    // 추가: 잠긴 트랙은 하이라이트하지 않음
    const track = tracks.find(t => t.id === trackId);
    if (track?.locked) {
      setDragOverTrackId(null); // 잠긴 트랙 위에서는 하이라이트 제거
      return;
    }
    
    // 추가: 원래 트랙으로 돌아오면 하이라이트하지 않음
    if (trackId === draggedSubtitle.sourceTrackId) {
      setDragOverTrackId(null);
      return;
    }

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
  }, [draggedSubtitle, hasLeftOriginalTrack, tracks]);

  const handleTrackMouseLeave = useCallback(() => {
    setDragOverTrackId(null);
  }, []);

  const TRACK_HEIGHT = 50;

  // Sidebar width state for resizable track header
  const [sidebarWidth, setSidebarWidth] = useState(180);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(180);

  // Reference to the entire tracks container to calculate percentage-based limits
  const containerWrapperRef = useRef<HTMLDivElement>(null);

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

      // Calculate raw new width in pixels
      const delta = e.clientX - startXRef.current;
      let newW = startWidthRef.current + delta;

      // Determine percentage-based constraints using the wrapper's width
      const wrapperWidth = containerWrapperRef.current?.clientWidth || window.innerWidth;
      const handleWidth = 4; // width of the resize handle (keep in sync with CSS)
      const min = 0; // allow collapsing completely
      const max = wrapperWidth - handleWidth; // allow expanding to full width minus handle

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
    <div className="neu-tracks-container" ref={containerWrapperRef}>
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
        <div className="h-10 flex-shrink-0" />

        {tracks.map((track) => (
          <TrackHeader
            key={track.id}
            track={track}
            isActive={selectedTrackId === track.id}
            onSelect={() => setSelectedTrackId(track.id)}
            onDelete={deleteTrack}
            onRename={(id, name) => updateTrack(id, { name })}
            onUpdateDetail={(id, detail) => updateTrack(id, { detail })}
            onToggleVisibility={(id, visible) => updateTrack(id, { visible })}
            onToggleLock={(id, locked) => updateTrack(id, { locked })}
          />
        ))}
      </div>

      {/* Resize handle */}
      <div className="neu-track-resize-handle" onMouseDown={handleResizeMouseDown} />

      {/* 🎯 Playhead moved here to be on top of the resize handle */}
      <div
        className="neu-playhead pointer-events-none"
        style={{
          left: `calc(${sidebarWidth}px + 4px + ${timeToPixel(currentTime)}px)`, // Offset by sidebar width + handle width
          zIndex: 90,
        }}
      >
        <div className="neu-playhead-line" />
        <div className="neu-playhead-head" />
      </div>

      {/* Right side: Ruler + tracks content */}
      <div 
        className="neu-tracks-content flex-1 flex flex-col relative"
        style={{
          maxHeight: '100%', // ✅ Ensure proper height constraint
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
            className={`neu-track-content${track.locked ? ' track-locked' : ''}${dragOverTrackId === track.id ? ' track-drag-over' : ''}`}
            style={{ 
              height: TRACK_HEIGHT,
              flexShrink: 0 // ✅ Prevent track height from shrinking
            }}
            onMouseEnter={() => handleTrackMouseEnter(track.id)}
            onMouseLeave={handleTrackMouseLeave}
            onMouseDown={() => {
              setSelectedTrackId(track.id);
              setSelectedSubtitleId(null);
            }}
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
      </div>
    </div>
  );
};

export default TracksContainer;