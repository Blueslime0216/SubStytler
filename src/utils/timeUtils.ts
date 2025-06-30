export const formatTime = (
  ms: number,
  fps: number = 30,
  format: 'frames' | 'ms' | 'seconds' = 'frames'
): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const seconds = totalSeconds % 60;
  
  const h = hours.toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');

  const timeBase = hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;

  switch (format) {
    case 'frames': {
      const frames = Math.floor((ms % 1000) / (1000 / fps));
      const f = frames.toString().padStart(Math.ceil(fps / 10).toString().length, '0');
      return `${timeBase}.${f}`;
    }
    case 'ms': {
      const centiseconds = Math.floor((ms % 1000) / 10);
      const cs = centiseconds.toString().padStart(2, '0');
      return `${timeBase}.${cs}`;
    }
    case 'seconds':
    default:
      return timeBase;
  }
};

export const parseTimeString = (timeString: string, fps: number = 30): number => {
  const parts = timeString.split(':');
  let hours = 0, minutes = 0, seconds = 0, frames = 0;
  
  if (parts.length === 3) {
    hours = parseInt(parts[0]);
    minutes = parseInt(parts[1]);
    const secondsParts = parts[2].split('.');
    seconds = parseInt(secondsParts[0]);
    frames = parseInt(secondsParts[1] || '0');
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0]);
    const secondsParts = parts[1].split('.');
    seconds = parseInt(secondsParts[0]);
    frames = parseInt(secondsParts[1] || '0');
  }
  
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + (frames * 1000) / fps;
};

export const msToFrames = (ms: number, fps: number): number => {
  return Math.floor((ms * fps) / 1000);
};

export const framesToMs = (frames: number, fps: number): number => {
  return (frames * 1000) / fps;
};

/**
 * Snap arbitrary time (ms) to the nearest timeline grid tick as used in TimelineRuler.
 * @param time         Raw time in ms
 * @param viewStart    Current view window start time (ms)
 * @param viewEnd      Current view window end time (ms)
 * @param containerW   Pixel width of the timeline viewport
 * @param fps          Frames per second (for minor tick calc)
 */
export function snapToTimelineGrid(
  time: number,
  viewStart: number,
  viewEnd: number,
  containerW: number,
  fps: number
): number {
  const viewDuration = viewEnd - viewStart;
  if (viewDuration <= 0 || containerW <= 0) return time;

  // 1) Determine major tick step (same logic as TimelineRuler)
  const minMajorTickSpacing = 120; // px
  const timePerPixel = viewDuration / containerW;
  const minTimeSpacing = minMajorTickSpacing * timePerPixel;
  const timeSteps = [1000, 2000, 5000, 10000, 30000, 60000];
  const majorStep = timeSteps.find((step) => step > minTimeSpacing) || 60000;

  // 2) Determine minor tick spacing (# of frames to skip)
  const frameDuration = 1000 / fps;
  const pixelsPerSecond = (1000 / viewDuration) * containerW;
  const pixelsPerFrame = pixelsPerSecond / fps;
  const minMinorTickSpacing = 5;
  let frameStep = 1;
  if (pixelsPerFrame < minMinorTickSpacing) {
    frameStep = Math.ceil(minMinorTickSpacing / pixelsPerFrame);
    if (frameStep > 2 && frameStep <= 5) frameStep = 5;
    else if (frameStep > 5 && frameStep <= 10) frameStep = 10;
    else if (frameStep > 10 && frameStep <= 30) frameStep = 30;
    else if (frameStep > 30) frameStep = 60;
  }

  // Candidate snap targets: major ticks + minor frame ticks
  const majorTarget = Math.round(time / majorStep) * majorStep;
  const frameTarget = Math.round(time / (frameDuration * frameStep)) * (frameDuration * frameStep);

  // Choose the closer of the two
  return Math.abs(time - majorTarget) < Math.abs(time - frameTarget) ? majorTarget : frameTarget;
}