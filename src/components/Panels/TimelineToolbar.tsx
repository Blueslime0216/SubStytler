import React, { useState } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

interface TimelineToolbarProps {
  onAddSubtitle: () => void;
  zoom: number;
  setZoom: (v:number)=>void;
  viewStart: number;
  viewEnd: number;
  setViewRange: (s:number,e:number)=>void;
  duration: number;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({ onAddSubtitle, zoom, setZoom, viewStart, viewEnd, setViewRange, duration }) => {
  const { currentTime } = useTimelineStore();

  const [inputValue, setInputValue] = useState<string>(zoom.toFixed(1));

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10;

  const clampZoom = (val: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, val));

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
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
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
    <div className="neu-toolbar flex items-center justify-between p-2 w-full">
      <button
        onClick={onAddSubtitle}
        className="neu-card neu-shadow-hover px-4 py-1.5 rounded-md active:neu-shadow-pressed transition-shadow"
      >
        <span className="neu-text-primary font-semibold text-sm select-none">Add Subtitle</span>
      </button>

      <div className="flex items-center gap-3 neu-card neu-shadow-inset px-3 py-1.5 rounded-md">
        <span className="neu-text-secondary text-sm select-none">Zoom</span>

        <button
          onClick={() => adjustZoom(-0.1)}
          className="neu-card-micro neu-shadow-hover w-7 h-7 flex items-center justify-center rounded-md disabled:opacity-40"
          title="Zoom out"
          disabled={zoom <= MIN_ZOOM}
        >
          <span className="font-bold select-none">−</span>
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          className="w-16 text-center bg-transparent outline-none neu-bg-surface neu-shadow-inset px-2 py-1 rounded-md focus:neu-shadow-hover"
          title="Scroll to zoom or type value"
        />

        <button
          onClick={() => adjustZoom(0.1)}
          className="neu-card-micro neu-shadow-hover w-7 h-7 flex items-center justify-center rounded-md disabled:opacity-40"
          title="Zoom in"
          disabled={zoom >= MAX_ZOOM}
        >
          <span className="font-bold select-none">+</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineToolbar; 