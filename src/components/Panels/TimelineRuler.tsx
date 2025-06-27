import React from 'react';
import { formatTime } from '../../utils/timeUtils';

interface TimelineRulerProps {
  viewStart: number;
  viewEnd: number;
  fps: number;
  timeToPixel: (time: number) => number;
  containerWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = React.memo(({ viewStart, viewEnd, fps, timeToPixel, containerWidth }) => {
  const viewDuration = viewEnd - viewStart;
  if (viewDuration <= 0 || !containerWidth) return null;

  const pixelsPerSecond = (1000 / viewDuration) * containerWidth;

  // Major time labels
  const majorTicks = [];
  const minMajorTickSpacing = 120; // min pixels between major labels
  const timePerPixel = viewDuration / containerWidth;
  const minTimeSpacing = minMajorTickSpacing * timePerPixel;
  
  // Find a suitable time step (e.g., 1, 2, 5, 10, 30, 60 seconds)
  const timeSteps = [1000, 2000, 5000, 10000, 30000, 60000];
  const majorStep = timeSteps.find(step => step > minTimeSpacing) || 60000;

  const startStep = Math.floor(viewStart / majorStep) * majorStep;

  for (let time = startStep; time <= viewEnd; time += majorStep) {
    const x = timeToPixel(time);
    if (x < 0 || x > containerWidth) continue; // keep ticks inside content area
    majorTicks.push(
      <div key={`major-${time}`} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
        <div className="timeline-major-tick" />
        <span className="timeline-major-label">{formatTime(time, fps, false)}</span>
      </div>
    );
  }

  // Minor ticks (frames)
  const minorTicks = [];
  const frameDuration = 1000 / fps;
  const pixelsPerFrame = pixelsPerSecond / fps;
  
  const minMinorTickSpacing = 5; // min pixels between minor ticks
  
  let frameStep = 1;
  if (pixelsPerFrame < minMinorTickSpacing) {
    frameStep = Math.ceil(minMinorTickSpacing / pixelsPerFrame);
    // Round to a nice number
    if (frameStep > 2 && frameStep <= 5) frameStep = 5;
    else if (frameStep > 5 && frameStep <= 10) frameStep = 10;
    else if (frameStep > 10 && frameStep <= 30) frameStep = 30;
    else if (frameStep > 30) frameStep = 60;
  }
  
  const startFrame = Math.floor(viewStart / frameDuration);
  const endFrame = Math.ceil(viewEnd / frameDuration);

  for (let frame = startFrame; frame <= endFrame; frame++) {
    if (frame % frameStep !== 0) continue;
    
    const time = frame * frameDuration;
    const x = timeToPixel(time);

    if (x < 0 || x > containerWidth) continue;

    const isSecondTick = frame % fps === 0;
    const isHalfSecondTick = frame % (fps / 2) === 0;

    const height = isSecondTick ? 'h-3' : isHalfSecondTick ? 'h-2' : 'h-1.5';
    const colorClass = isSecondTick ? 'timeline-minor-tick-major' : 'timeline-minor-tick';

    minorTicks.push(
      <div
        key={`minor-${frame}`}
        className={`absolute bottom-0 w-px ${height} ${colorClass}`}
        style={{ left: x }}
      />
    );
  }

  return (
    <div className="h-10 neu-timeline-ruler relative overflow-hidden cursor-ew-resize">
      {majorTicks}
      {minorTicks}
    </div>
  );
});

export default TimelineRuler; 