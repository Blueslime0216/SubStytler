import React, { useState } from 'react';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { useTimelineStore } from '../../stores/timelineStore';

interface TimelineToolbarProps {
  onAddSubtitle: () => void;
  zoom: number;
  setZoom: (v: number) => void;
  viewStart: number;
  viewEnd: number;
  setViewRange: (s: number, e: number) => void;
  duration: number;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({ 
  onAddSubtitle, 
  zoom, 
  setZoom, 
  viewStart, 
  viewEnd, 
  setViewRange, 
  duration 
}) => {
  const { currentTime } = useTimelineStore();
  const [inputValue, setInputValue] = useState<string>(zoom.toFixed(1));

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 100;

  const clampZoom = (val: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, val));

  const commitZoom = (val: number) => {
    const z = clampZoom(parseFloat(val.toFixed(2)));
    if (z === zoom) {
      setInputValue(z.toFixed(1));
      return;
    }

    const ratio = (currentTime - viewStart) / (viewEnd - viewStart);
    const newViewDuration = duration / z;
    let newStart = currentTime - ratio * newViewDuration;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const num = parseFloat(inputValue);
      commitZoom(isNaN(num) ? zoom : num);
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const adjustZoom = (delta: number) => {
    const tentative = clampZoom(parseFloat((zoom + delta).toFixed(2)));
    commitZoom(tentative);
  };

  React.useEffect(() => {
    setInputValue(zoom.toFixed(1));
  }, [zoom]);

  return (
    <div className="timeline-toolbar">
      <button
        onClick={onAddSubtitle}
        className="btn btn-primary"
        title="Add new subtitle"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Subtitle
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Zoom</span>
        
        <button
          onClick={() => adjustZoom(-1)}
          className="btn btn-icon-sm"
          title="Zoom out"
          disabled={zoom <= MIN_ZOOM}
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="input input-sm w-16 text-center"
          title="Zoom level"
        />

        <button
          onClick={() => adjustZoom(1)}
          className="btn btn-icon-sm"
          title="Zoom in"
          disabled={zoom >= MAX_ZOOM}
        >
          <ZoomIn className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TimelineToolbar;