import React, { useMemo } from 'react';
import { formatTime } from '../../utils/timeUtils';

interface TimelineRulerProps {
  viewStart: number;
  viewEnd: number;
  fps: number;
  timeToPixel: (time: number) => number;
  containerWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = React.memo(({ 
  viewStart, 
  viewEnd, 
  fps, 
  timeToPixel, 
  containerWidth 
}) => {
  const viewDuration = viewEnd - viewStart;
  if (viewDuration <= 0 || !containerWidth) return null;

  // Calculate pixels per second and millisecond for current zoom level
  const pixelsPerSecond = (1000 / viewDuration) * containerWidth;
  const pixelsPerMs = pixelsPerSecond / 1000;
  
  // Calculate frame duration in milliseconds
  const frameDuration = 1000 / fps;
  const pixelsPerFrame = pixelsPerSecond / fps;

  // Dynamically determine time intervals based on zoom level
  const { majorInterval, minorInterval, majorTickFormat, showFrames } = useMemo(() => {
    // Target: major ticks should be ~100-200px apart
    const targetMajorSpacing = 150;
    
    // Possible time intervals in milliseconds
    const timeIntervals = [
      { ms: 50, label: 'frames' },      // 0.05s
      { ms: 100, label: 'frames' },     // 0.1s
      { ms: 200, label: 'frames' },     // 0.2s
      { ms: 500, label: 'frames' },     // 0.5s
      { ms: 1000, label: 'seconds' },   // 1s
      { ms: 5000, label: 'seconds' },   // 5s
      { ms: 10000, label: 'seconds' },  // 10s
      { ms: 15000, label: 'seconds' },  // 15s
      { ms: 30000, label: 'seconds' },  // 30s
      { ms: 60000, label: 'minutes' },  // 1m
      { ms: 300000, label: 'minutes' }, // 5m
      { ms: 600000, label: 'minutes' }, // 10m
      { ms: 1800000, label: 'minutes' }, // 30m
      { ms: 3600000, label: 'hours' },  // 1h
    ];
    
    // Find the appropriate interval
    let selectedInterval = timeIntervals[timeIntervals.length - 1];
    for (const interval of timeIntervals) {
      if (interval.ms * pixelsPerMs >= targetMajorSpacing) {
        selectedInterval = interval;
        break;
      }
    }
    
    // Determine minor interval (usually 1/5 or 1/10 of major)
    let minorIntervalMs;
    if (selectedInterval.ms <= 1000) {
      // For sub-second intervals, use frame-based minor ticks
      minorIntervalMs = frameDuration;
    } else if (selectedInterval.ms <= 10000) {
      // For 1-10s intervals, use 1s minor ticks
      minorIntervalMs = 1000;
    } else {
      // For larger intervals, divide by 5
      minorIntervalMs = selectedInterval.ms / 5;
    }
    
    // Determine if we should show individual frames
    // Show frames when we have at least 20px per frame
    const showIndividualFrames = pixelsPerFrame >= 20;
    
    return {
      majorInterval: selectedInterval.ms,
      minorInterval: minorIntervalMs,
      majorTickFormat: selectedInterval.label,
      showFrames: showIndividualFrames
    };
  }, [pixelsPerMs, pixelsPerFrame, frameDuration]);

  // Generate major time markers
  const majorTicks = useMemo(() => {
    const ticks = [];
    // Start from the nearest major interval before viewStart
    const startTime = Math.floor(viewStart / majorInterval) * majorInterval;
    
    for (let time = startTime; time <= viewEnd; time += majorInterval) {
      const x = timeToPixel(time);
      if (x >= 0 && x <= containerWidth) {
        ticks.push(
          <div key={`major-${time}`} className="absolute top-0 flex flex-col items-center" style={{ left: x, transform: 'translateX(-50%)' }}>
            <div className="timeline-major-tick" />
            <span className="timeline-major-label">{formatTime(time, fps, majorTickFormat as any)}</span>
          </div>
        );
      }
    }
    return ticks;
  }, [viewStart, viewEnd, majorInterval, timeToPixel, containerWidth, fps, majorTickFormat]);

  // Generate minor time markers
  const minorTicks = useMemo(() => {
    const ticks = [];
    
    // If we're showing individual frames, use frame-based ticks
    if (showFrames) {
      const startFrame = Math.floor(viewStart / frameDuration);
      const endFrame = Math.ceil(viewEnd / frameDuration);
      
      for (let frame = startFrame; frame <= endFrame; frame++) {
        const time = frame * frameDuration;
        const x = timeToPixel(time);
        
        if (x < 0 || x > containerWidth) continue;
        
        // Skip if this is already a major tick
        if (time % majorInterval === 0) continue;
        
        // Determine tick height based on position
        const isSecondTick = frame % fps === 0;
        const isHalfSecondTick = frame % (fps / 2) === 0;
        const isQuarterSecondTick = frame % (fps / 4) === 0;
        
        let height, colorClass;
        
        if (isSecondTick) {
          height = 'h-3';
          colorClass = 'timeline-minor-tick-major';
        } else if (isHalfSecondTick) {
          height = 'h-2.5';
          colorClass = 'timeline-minor-tick-major';
        } else if (isQuarterSecondTick) {
          height = 'h-2';
          colorClass = 'timeline-minor-tick';
        } else {
          height = 'h-1.5';
          colorClass = 'timeline-minor-tick';
        }
        
        ticks.push(
          <div
            key={`minor-${frame}`}
            className={`absolute bottom-0 w-px ${height} ${colorClass}`}
            style={{ left: x }}
          />
        );
      }
    } else {
      // Use time-based minor ticks
      const startTime = Math.floor(viewStart / minorInterval) * minorInterval;
      
      for (let time = startTime; time <= viewEnd; time += minorInterval) {
        const x = timeToPixel(time);
        
        if (x < 0 || x > containerWidth) continue;
        
        // Skip if this is already a major tick
        if (time % majorInterval === 0) continue;
        
        // Determine tick height based on position
        const isHalfMajor = time % (majorInterval / 2) === 0;
        const height = isHalfMajor ? 'h-2.5' : 'h-1.5';
        const colorClass = isHalfMajor ? 'timeline-minor-tick-major' : 'timeline-minor-tick';
        
        ticks.push(
          <div
            key={`minor-${time}`}
            className={`absolute bottom-0 w-px ${height} ${colorClass}`}
            style={{ left: x }}
          />
        );
      }
    }
    
    return ticks;
  }, [viewStart, viewEnd, minorInterval, majorInterval, timeToPixel, containerWidth, showFrames, frameDuration, fps]);

  // Add frame grid lines when zoomed in enough
  const frameGridLines = useMemo(() => {
    if (!showFrames) return null;
    
    const lines = [];
    const startFrame = Math.floor(viewStart / frameDuration);
    const endFrame = Math.ceil(viewEnd / frameDuration);
    
    for (let frame = startFrame; frame <= endFrame; frame++) {
      const time = frame * frameDuration;
      const x = timeToPixel(time);
      
      if (x < 0 || x > containerWidth) continue;
      
      lines.push(
        <div
          key={`grid-${frame}`}
          className="absolute top-10 bottom-0 w-px neu-frame-grid-line"
          style={{ 
            left: x, 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      );
    }
    
    return lines;
  }, [viewStart, viewEnd, frameDuration, timeToPixel, containerWidth, showFrames]);

  return (
    <div className="h-10 neu-timeline-ruler relative flex-shrink-0 overflow-hidden cursor-ew-resize">
      {majorTicks}
      {minorTicks}
      {frameGridLines}
    </div>
  );
});

export default TimelineRuler;