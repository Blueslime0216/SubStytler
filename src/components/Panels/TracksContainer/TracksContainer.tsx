import React, { useState, useRef } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineInteraction } from '../../../hooks/useTimelineInteraction';
import { useSelectedTrackStore } from '../../../stores/selectedTrackStore';
import { useSelectedSubtitleStore } from '../../../stores/selectedSubtitleStore';
import { useSubtitleHighlightStore } from '../../../stores/subtitleHighlightStore';
import { TrackHeadersSection } from './TrackHeadersSection';
import { TrackContentsSection } from './TrackContentsSection';
import { TrackContextMenus } from './TrackContextMenus';

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

const TracksContainer: React.FC<TracksContainerProps> = ({
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
  const { currentProject } = useProjectStore();
  
  const [draggedSubtitle, setDraggedSubtitle] = useState<{ id: string, sourceTrackId: string } | null>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);
  const [hasLeftOriginalTrack, setHasLeftOriginalTrack] = useState(false);

  const tracks = currentProject?.tracks || [];
  const subtitles = currentProject?.subtitles || [];

  const { selectedTrackId, setSelectedTrackId } = useSelectedTrackStore();
  const { setSelectedSubtitleId } = useSelectedSubtitleStore();
  const { flashIds, setHighlightedIds } = useSubtitleHighlightStore();

  // Context menu state
  const [trackHeaderContextMenu, setTrackHeaderContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    trackId: string | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    trackId: null
  });

  const [trackContentContextMenu, setTrackContentContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    trackId: string | null;
    subtitleId: string | null;
    time: number | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    trackId: null,
    subtitleId: null,
    time: null
  });

  // Sidebar width state for resizable track header
  const [sidebarWidth, setSidebarWidth] = useState<number>(180);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(180);

  // Reference to the entire tracks container to calculate percentage-based limits
  const containerWrapperRef = useRef<HTMLDivElement>(null);

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

  // Notify parent of sidebar width changes
  React.useEffect(() => {
    if (typeof onSidebarWidthChange === 'function') {
      onSidebarWidthChange(sidebarWidth);
    }
  }, [sidebarWidth, onSidebarWidthChange]);

  // Context menu handlers
  const handleTrackHeaderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Find the track header element that was right-clicked
    const trackHeader = (e.target as HTMLElement).closest('.neu-track-header-redesigned');
    if (!trackHeader) {
      // Clicked on the header area but not on a specific track
      setTrackHeaderContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        trackId: null
      });
      return;
    }
    
    // Get the track ID from the data attribute
    const trackId = trackHeader.getAttribute('data-track-id');
    if (trackId) {
      setTrackHeaderContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        trackId
      });
    }
  };

  const handleTrackContentContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Find if a subtitle block was right-clicked
    const subtitleBlock = (e.target as HTMLElement).closest('.neu-subtitle-block');
    
    // Calculate time at click position
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const time = pixelToTime(x);
    
    // Calculate which track was clicked based on Y position
    const relativeY = e.clientY - rect.top - 40; // 40px ruler height
    const trackIndex = Math.floor(relativeY / TRACK_HEIGHT);
    const trackId = tracks[trackIndex]?.id || null;
    
    if (subtitleBlock) {
      // Right-clicked on a subtitle
      const subtitleId = subtitleBlock.getAttribute('data-subtitle-id');
      setTrackContentContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        trackId,
        subtitleId,
        time
      });
    } else if (trackId) {
      // Right-clicked on a track but not on a subtitle
      setTrackContentContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        trackId,
        subtitleId: null,
        time
      });
    } else {
      // Right-clicked on empty space
      setTrackContentContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        trackId: null,
        subtitleId: null,
        time
      });
    }
  };

  const closeAllContextMenus = () => {
    setTrackHeaderContextMenu(prev => ({ ...prev, isOpen: false }));
    setTrackContentContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Improved time/pixel conversion functions
  const timeToPixel = React.useCallback((time: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    if (viewDuration === 0) return 0;
    return ((time - viewStart) / viewDuration) * width;
  }, [viewStart, viewEnd, containerRef]);

  const pixelToTime = React.useCallback((pixel: number): number => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return viewStart + (pixel / width) * viewDuration;
  }, [viewStart, viewEnd, containerRef]);

  const handleSubtitleDragStart = React.useCallback((subtitleId: string, trackId: string) => {
    setDraggedSubtitle({ id: subtitleId, sourceTrackId: trackId });
    setHasLeftOriginalTrack(false);
  }, []);

  const handleSubtitleDragEnd = React.useCallback(() => {
    setDraggedSubtitle(null);
    setDragOverTrackId(null);
    setHasLeftOriginalTrack(false);
  }, []);

  // Track hover detection for visual feedback during drag
  const handleTrackMouseEnter = React.useCallback((trackId: string) => {
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

  const handleTrackMouseLeave = React.useCallback(() => {
    setDragOverTrackId(null);
  }, []);

  const TRACK_HEIGHT = 50;

  return (
    <div className="neu-tracks-container" ref={containerWrapperRef}>
      <TrackHeadersSection 
        headerRef={useRef<HTMLDivElement>(null)}
        sidebarWidth={sidebarWidth}
        tracks={tracks}
        selectedTrackId={selectedTrackId}
        setSelectedTrackId={setSelectedTrackId}
        handleTrackHeaderContextMenu={handleTrackHeaderContextMenu}
      />

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

      <TrackContentsSection 
        containerRef={containerRef}
        tracks={tracks}
        subtitles={subtitles}
        selectedTrackId={selectedTrackId}
        setSelectedTrackId={setSelectedTrackId}
        setSelectedSubtitleId={setSelectedSubtitleId}
        viewStart={viewStart}
        viewEnd={viewEnd}
        fps={fps}
        timeToPixel={timeToPixel}
        pixelToTime={pixelToTime}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleWheel={handleWheel}
        setIsHovered={setIsHovered}
        handleTrackContentContextMenu={handleTrackContentContextMenu}
        handleTrackMouseEnter={handleTrackMouseEnter}
        handleTrackMouseLeave={handleTrackMouseLeave}
        handleSubtitleDragStart={handleSubtitleDragStart}
        handleSubtitleDragEnd={handleSubtitleDragEnd}
        dragOverTrackId={dragOverTrackId}
        TRACK_HEIGHT={TRACK_HEIGHT}
      />

      <TrackContextMenus 
        trackHeaderContextMenu={trackHeaderContextMenu}
        trackContentContextMenu={trackContentContextMenu}
        tracks={tracks}
        closeAllContextMenus={closeAllContextMenus}
        selectedTrackId={selectedTrackId}
        setSelectedTrackId={setSelectedTrackId}
        flashIds={flashIds}
      />
    </div>
  );
};

export default TracksContainer;