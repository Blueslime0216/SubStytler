import React, { forwardRef } from 'react';
import { TrackHeaderRef } from '../TrackHeader';
import TrackHeader from '../TrackHeader';
import { SubtitleTrack } from '../../../types/project';

interface TrackHeadersSectionProps {
  headerRef: React.RefObject<HTMLDivElement>;
  sidebarWidth: number;
  tracks: SubtitleTrack[];
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  handleTrackHeaderContextMenu: (e: React.MouseEvent) => void;
}

export const TrackHeadersSection: React.FC<TrackHeadersSectionProps> = ({
  headerRef,
  sidebarWidth,
  tracks,
  selectedTrackId,
  setSelectedTrackId,
  handleTrackHeaderContextMenu
}) => {
  // Refs for track headers to access their methods
  const trackHeaderRefs = React.useRef<Map<string, React.RefObject<TrackHeaderRef>>>(new Map());

  // Ensure refs are created for all tracks
  React.useEffect(() => {
    tracks.forEach(track => {
      if (!trackHeaderRefs.current.has(track.id)) {
        trackHeaderRefs.current.set(track.id, React.createRef<TrackHeaderRef>());
      }
    });
  }, [tracks]);

  const handleHeaderScroll = React.useCallback(() => {
    if (!headerRef.current || !document.querySelector('.neu-tracks-content')) return;
    (document.querySelector('.neu-tracks-content') as HTMLElement).scrollTop = headerRef.current.scrollTop;
  }, [headerRef]);

  return (
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
      onContextMenu={handleTrackHeaderContextMenu}
    >
      {/* Spacer to align with Ruler */}
      <div className="h-10 flex-shrink-0" />

      {tracks.map((track) => (
        <TrackHeader
          key={track.id}
          ref={trackHeaderRefs.current.get(track.id)}
          track={track}
          isActive={selectedTrackId === track.id}
          onSelect={() => setSelectedTrackId(track.id)}
          onDelete={() => {}} // These will be handled by context menu
          onRename={() => {}}
          onUpdateDetail={() => {}}
          onToggleVisibility={() => {}}
          onToggleLock={() => {}}
        />
      ))}
    </div>
  );
};