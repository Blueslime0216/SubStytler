import React from 'react';
import { formatTime } from '../../utils/timeUtils';

interface TimelineRulerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  viewStart: number;
  viewEnd: number;
  fps: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  containerRef,
  viewStart,
  viewEnd,
  fps
}) => {
  const timeToPixel = (time: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return ((time - viewStart) / viewDuration) * containerWidth;
  };

  const renderTimeRuler = () => {
    const steps = [];
    const pixelsPerSecond = timeToPixel(viewStart + 1000) - timeToPixel(viewStart);
    const step = pixelsPerSecond < 50 ? 5000 : pixelsPerSecond < 100 ? 2000 : 1000;
    
    for (let time = Math.floor(viewStart / step) * step; time <= viewEnd; time += step) {
      const x = timeToPixel(time);
      if (x < 0 || x > (containerRef.current?.clientWidth || 0)) continue;
      
      steps.push(
        <div
          key={time}
          className="absolute flex flex-col items-center"
          style={{ left: x }}
        >
          <div className="w-px h-4" style={{ backgroundColor: 'var(--border-secondary)' }} />
          <span className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatTime(time, fps)}
          </span>
        </div>
      );
    }
    
    return steps;
  };

  return (
    <div className="timeline-ruler h-12 relative overflow-hidden">
      {renderTimeRuler()}
    </div>
  );
};