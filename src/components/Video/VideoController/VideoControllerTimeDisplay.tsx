import React from 'react';
import { formatTime } from '../../../utils/timeUtils';

interface VideoControllerTimeDisplayProps {
  currentTime: number;
  duration: number;
  frameNumber: number;
  fps: number;
}

const VideoControllerTimeDisplay: React.FC<VideoControllerTimeDisplayProps> = ({
  currentTime,
  duration,
  frameNumber,
  fps
}) => {
  // FPS 값을 소수점 없이 정수로 표시하거나, 소수점이 있는 경우 한 자리까지만 표시
  const displayFps = Number.isInteger(fps) ? fps.toString() : fps.toFixed(1);
  
  return (
    <div className="video-controller-time-display">
      <span className="video-controller-time">
        {formatTime(currentTime, fps, 'ms')} / {formatTime(duration, fps, 'ms')}
      </span>
      <span className="video-controller-frame">
        {String(frameNumber).padStart(5, '0')}
      </span>
      <span className="video-controller-fps">
        {displayFps}FPS
      </span>
    </div>
  );
};

export default VideoControllerTimeDisplay;