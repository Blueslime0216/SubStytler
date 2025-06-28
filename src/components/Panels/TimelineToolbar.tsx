import React, { useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

interface TimelineToolbarProps {
  onAddSubtitle: () => void;
  onAddTrack: () => void;
  zoom: number;
  setZoom: (v:number)=>void;
  viewStart: number;
  viewEnd: number;
  setViewRange: (s:number,e:number)=>void;
  duration: number;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({ onAddSubtitle, onAddTrack, zoom, setZoom, viewStart, viewEnd, setViewRange, duration }) => {
  const { currentTime } = useTimelineStore();

  const [inputValue, setInputValue] = useState<string>(zoom.toFixed(1));

  const MIN_ZOOM = 1; // cannot zoom below full view
  
  // Calculate max zoom based on pixel-per-ms ratio
  const calculateMaxZoom = () => {
    // We want to limit zoom so that 1ms = 10px maximum
    // At zoom level 1, the entire duration is visible
    // So max zoom = (containerWidth / duration) * 10
    
    // Estimate container width (can be adjusted based on your layout)
    const estimatedContainerWidth = window.innerWidth * 0.7; // 70% of window width
    return (estimatedContainerWidth / duration) * 10;
  };

  const clampZoom = (val: number) => {
    const maxZoom = calculateMaxZoom();
    return Math.max(MIN_ZOOM, Math.min(maxZoom, val));
  };

  const recalcViewRange = (newZoom: number, pivotTime?: number) => {
    const center = pivotTime ?? (viewStart + viewEnd) / 2;
    const newViewDuration = duration / newZoom;
    let newStart = center - newViewDuration / 2;
    let newEnd = center + newViewDuration / 2;
    if (newStart < 0) {
      newStart = 0;
      newEnd = newViewDuration;
    }
    if (newEnd > duration) {
      newEnd = duration;
      newStart = duration - newViewDuration;
    }
    setViewRange(newStart, newEnd);
  };

  const commitZoom = (val: number) => {
    const z = clampZoom(parseFloat(val.toFixed(2)));
    if (z === zoom) {
      setInputValue(z.toFixed(1));
      return;
    }

    // Preserve current indicator relative position in view window
    const ratio = (currentTime - viewStart) / (viewEnd - viewStart);
    const newViewDuration = duration / z;
    let newStart = currentTime - ratio * newViewDuration;
    // clamp within duration
    newStart = Math.max(0, Math.min(duration - newViewDuration, newStart));
    const newEnd = newStart + newViewDuration;

    setZoom(z);
    setViewRange(newStart, newEnd);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      commitZoom(num);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    const tentative = clampZoom(parseFloat((zoom + delta).toFixed(2)));
    if (tentative === zoom) return; // at limit
    commitZoom(tentative);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const num = parseFloat(inputValue);
      commitZoom(isNaN(num) ? zoom : num);
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const adjustZoom = (delta: number) => {
    const tentative = clampZoom(parseFloat((zoom+delta).toFixed(2)));
    commitZoom(tentative);
  };

  React.useEffect(() => {
    setInputValue(zoom.toFixed(1));
  }, [zoom]);

  return (
    <div className="timeline-toolbar">
      <button
        onClick={onAddSubtitle}
        className="timeline-toolbar-btn"
      >
        <span className="timeline-toolbar-btn-label">Add Subtitle</span>
      </button>

      <button
        onClick={onAddTrack}
        className="timeline-toolbar-btn"
      >
        <span className="timeline-toolbar-btn-label">Add Track</span>
      </button>

      <div className="timeline-toolbar-zoom">
        <span className="timeline-toolbar-zoom-label">Zoom</span>

        <button
          onClick={() => adjustZoom(-1)}
          className="timeline-toolbar-zoom-btn"
          title="Zoom out"
          disabled={zoom <= MIN_ZOOM}
        >
          <span className="timeline-toolbar-zoom-btn-label">−</span>
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          className="timeline-toolbar-zoom-input"
          title="Scroll to zoom or type value"
        />

        <button
          onClick={() => adjustZoom(1)}
          className="timeline-toolbar-zoom-btn"
          title="Zoom in"
          disabled={zoom >= calculateMaxZoom()}
        >
          <span className="timeline-toolbar-zoom-btn-label">+</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineToolbar;