import React from 'react';
import TimelineRuler from '../TimelineRuler';
import SubtitleBlock from '../SubtitleBlock';
import { SubtitleTrack, SubtitleBlock as SubtitleBlockType } from '../../../types/project';

interface TrackContentsSectionProps {
  containerRef: React.RefObject<HTMLDivElement>;
  tracks: SubtitleTrack[];
  subtitles: SubtitleBlockType[];
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  setSelectedSubtitleId: (id: string | null) => void;
  viewStart: number;
  viewEnd: number;
  fps: number;
  timeToPixel: (time: number) => number;
  pixelToTime: (pixel: number) => number;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleWheel: (e: React.WheelEvent) => void;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  handleTrackContentContextMenu: (e: React.MouseEvent) => void;
  handleTrackMouseEnter: (trackId: string) => void;
  handleTrackMouseLeave: () => void;
  handleSubtitleDragStart: (subtitleId: string, trackId: string) => void;
  handleSubtitleDragEnd: () => void;
  dragOverTrackId: string | null;
  TRACK_HEIGHT: number;
  isSubtitleDragging?: boolean;
}

export const TrackContentsSection: React.FC<TrackContentsSectionProps> = ({
  containerRef,
  tracks,
  subtitles,
  selectedTrackId,
  setSelectedTrackId,
  setSelectedSubtitleId,
  viewStart,
  viewEnd,
  fps,
  timeToPixel,
  pixelToTime,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  setIsHovered,
  handleTrackContentContextMenu,
  handleTrackMouseEnter,
  handleTrackMouseLeave,
  handleSubtitleDragStart,
  handleSubtitleDragEnd,
  dragOverTrackId,
  TRACK_HEIGHT,
  isSubtitleDragging = false
}) => {
  const handleContentScroll = React.useCallback(() => {
    if (!containerRef.current || !document.querySelector('.neu-tracks-header')) return;
    (document.querySelector('.neu-tracks-header') as HTMLElement).scrollTop = containerRef.current.scrollTop;
  }, [containerRef]);

  return (
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
      onWheel={e => {
        if (isSubtitleDragging) {
          e.preventDefault();
          return;
        }
        handleWheel(e);
      }}
      onScroll={handleContentScroll}
      onContextMenu={handleTrackContentContextMenu}
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
          className={`neu-track-content${track.locked ? ' track-locked' : ''}${dragOverTrackId === track.id ? ' track-drag-over' : ''}${selectedTrackId === track.id ? ' bg-blue-500' : ''}`}
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
            .filter((subtitle) => subtitle.trackId === track.id)
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
                isHiddenTrack={!track.visible}
                trackIndex={trackIndex}
                trackHeight={TRACK_HEIGHT}
              />
            ))}
        </div>
      ))}
    </div>
  );
};