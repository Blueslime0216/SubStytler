import React from 'react';
import { formatTime } from '../../utils/timeUtils';

interface TimelineRulerProps {
  viewStart: number;
  viewEnd: number;
  fps: number;
  timeToPixel: (time: number) => number;
  containerWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({ viewStart, viewEnd, fps, timeToPixel, containerWidth }) => {
  // Time ruler
  const steps = [];
  const pixelsPerSecond = timeToPixel(viewStart + 1000) - timeToPixel(viewStart);
  const step = pixelsPerSecond < 50 ? 5000 : pixelsPerSecond < 100 ? 2000 : 1000;
  for (let time = Math.floor(viewStart / step) * step; time <= viewEnd; time += step) {
    const x = timeToPixel(time);
    if (x < 0 || x > containerWidth) continue;
    steps.push(
      <div key={time} className="absolute flex flex-col items-center" style={{ left: x }}>
        <div className="w-px h-4 neu-text-secondary" />
        <span className="neu-caption font-mono mt-1">{formatTime(time, fps)}</span>
      </div>
    );
  }

  // Frame grid
  const lines = [];
  const frameDuration = 1000 / fps;
  const startFrame = Math.floor(viewStart / frameDuration);
  const endFrame = Math.ceil(viewEnd / frameDuration);
  for (let frame = startFrame; frame <= endFrame; frame++) {
    const time = frame * frameDuration;
    const x = timeToPixel(time);
    if (x < 0 || x > containerWidth) continue;
    lines.push(
      <div
        key={frame}
        className="absolute w-px h-full neu-frame-grid-line"
        style={{ left: x, background: 'var(--neu-text-muted)', transition: 'none' }}
      />
    );
  }

  return (
    <div className="h-14 neu-timeline-ruler relative overflow-hidden">
      {steps}
      {lines}
    </div>
  );
};

export default TimelineRuler; 