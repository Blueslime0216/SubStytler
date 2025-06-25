export const formatTime = (ms: number, fps: number = 30, showFrames: boolean = true): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const seconds = totalSeconds % 60;
  
  const h = hours.toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');

  if (!showFrames) {
    if (hours > 0) {
      return `${h}:${m}:${s}`;
    }
    return `${m}:${s}`;
  }

  const frames = Math.floor((ms % 1000) / (1000 / fps));
  const f = frames.toString().padStart(Math.ceil(fps / 10).toString().length, '0');
  
  if (hours > 0) {
    return `${h}:${m}:${s}.${f}`;
  }
  
  return `${m}:${s}.${f}`;
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