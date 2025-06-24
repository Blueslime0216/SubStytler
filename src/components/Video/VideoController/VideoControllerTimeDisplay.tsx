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
  return (
    <div className="video-controller-time-display">
      <span className="video-controller-time">
        {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
      </span>
      <span className="video-controller-frame">
        {String(frameNumber).padStart(5, '0')}
      </span>
      <span className="video-controller-fps">
        {fps}FPS
      </span>
    </div>
  );
};

export default VideoControllerTimeDisplay; 