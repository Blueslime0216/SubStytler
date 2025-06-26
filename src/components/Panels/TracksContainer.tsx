import React, { useState } from 'react';
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
  setViewRange: (s:number,e:number)=>void;
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
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
  setIsHovered
}) => {
  const {
    currentProject,
    addTrack,
    updateTrack,
    deleteTrack,
    updateSubtitle
  } = useProjectStore();
  
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [draggedSubtitle, setDraggedSubtitle] = useState<{ id: string, sourceTrackId: string } | null>(null);

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
  const handleMouseDown = (e:React.MouseEvent)=>{
    if(isResizingRef.current) return;
    tMouseDown(e);
  };
  const handleMouseMove = (e:React.MouseEvent)=>{
    if(isResizingRef.current) return;
    tMouseMove(e);
  };
  const handleMouseUp = (e:React.MouseEvent)=>{
    if(isResizingRef.current) return;
    tMouseUp(e);
  };
  const handleWheel = (e:React.WheelEvent)=>{
    if(isResizingRef.current) return;
    tWheel(e);
  };

  const timeToPixel = (time:number)=>{
    if(!containerRef.current) return 0;
    const width = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    if(viewDuration===0) return 0;
    return ((time - viewStart)/viewDuration)*width;
  };

  const handleAddTrack = () => {
    const trackNumber = tracks.length + 1;
    const trackId = addTrack(`Track ${trackNumber}`);
    if (trackId) {
      setActiveTrackId(trackId);
    }
  };

  const handleSubtitleDragStart = (subtitleId: string, trackId: string) => {
    setDraggedSubtitle({ id: subtitleId, sourceTrackId: trackId });
  };

  const handleTrackDragOver = (trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedSubtitle && draggedSubtitle.sourceTrackId !== trackId) {
      // Visual indication that this is a valid drop target
      e.currentTarget.classList.add('bg-opacity-20', 'bg-blue-500');
    }
  };

  const handleTrackDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-opacity-20', 'bg-blue-500');
  };

  const handleTrackDrop = (trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-20', 'bg-blue-500');
    
    if (draggedSubtitle && draggedSubtitle.sourceTrackId !== trackId) {
      // Move subtitle to new track
      updateSubtitle(draggedSubtitle.id, { trackId });
      setDraggedSubtitle(null);
    }
  };

  const RULER_HEIGHT = 40;

  // Sidebar width state for resizable track header
  const [sidebarWidth, setSidebarWidth] = useState(180);
  const isResizingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(180);

  const handleResizeMouseDown = (e:React.MouseEvent)=>{
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  React.useEffect(()=>{
    const handleMove=(e:MouseEvent)=>{
      if(!isResizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      let newW = startWidthRef.current + delta;
      const min = 120;
      const max = 400;
      newW = Math.max(min, Math.min(max, newW));
      setSidebarWidth(newW);
    };
    const stop=()=>{ isResizingRef.current=false; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    return ()=>{
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
    };
  },[]);

  return (
    <div className="neu-tracks-container">
      {/* Track headers */}
      <div className="neu-tracks-header" style={{width: sidebarWidth}}>
        {/* Spacer to align with Ruler */}
        <div style={{ height: RULER_HEIGHT }} />

        {tracks.map((track) => (
          <TrackHeader
            key={track.id}
            track={track}
            isActive={activeTrackId === track.id}
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
      <div className="neu-tracks-content flex-1 flex flex-col relative"
           ref={containerRef}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseEnter={()=>setIsHovered(true)}
           onMouseLeave={()=>{ setIsHovered(false); }}
           onWheel={handleWheel}
      >
        <TimelineRuler
          viewStart={viewStart}
          viewEnd={viewEnd}
          fps={fps}
          timeToPixel={timeToPixel}
          containerWidth={containerRef.current?.clientWidth || 0}
        />

        {tracks.map((track) => (
          <div
            key={track.id}
            className={`neu-track-content ${track.locked ? 'opacity-70' : ''}`}
            onClick={() => setActiveTrackId(track.id)}
            onDragOver={(e) => handleTrackDragOver(track.id, e)}
            onDragLeave={handleTrackDragLeave}
            onDrop={(e) => handleTrackDrop(track.id, e)}
          >
            {/* Render subtitles for this track */}
            {subtitles
              .filter((subtitle) => subtitle.trackId === track.id && track.visible)
              .map((subtitle) => (
                <SubtitleBlock
                  key={subtitle.id}
                  subtitle={subtitle}
                  timeToPixel={timeToPixel}
                  containerRef={containerRef}
                  onDragStart={() => handleSubtitleDragStart(subtitle.id, track.id)}
                  isLocked={track.locked}
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