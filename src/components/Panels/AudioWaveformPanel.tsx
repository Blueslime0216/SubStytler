import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';

export const AudioWaveformPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, duration, viewStart, viewEnd, setCurrentTime } = useTimelineStore();
  const { currentProject } = useProjectStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    // Generate sample waveform data
    ctx.strokeStyle = 'var(--neu-primary)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
      const time = viewStart + (x / width) * (viewEnd - viewStart);
      const amplitude = Math.sin(time / 100) * Math.random() * 0.5 + 0.3;
      const y = centerY + amplitude * centerY * Math.sin(time / 50);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw playhead
    if (currentTime >= viewStart && currentTime <= viewEnd) {
      const playheadX = ((currentTime - viewStart) / (viewEnd - viewStart)) * width;
      ctx.strokeStyle = 'var(--neu-error)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [currentTime, viewStart, viewEnd, duration]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = viewStart + (x / rect.width) * (viewEnd - viewStart);
    setCurrentTime(clickTime);
  };

  if (!currentProject?.videoMeta) {
    return (
      <div className="neu-audio-waveform-panel h-full flex items-center justify-center neu-text-secondary">
        <p className="text-sm">Load a video to see the audio waveform</p>
      </div>
    );
  }

  return (
    <div className="neu-audio-waveform-panel h-full neu-bg-base p-3">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer rounded-lg neu-shadow-inset"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};