import React from 'react';
import { formatTime } from '../../../utils/timeUtils';
import { Clock } from 'lucide-react';

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
  // FPS value to display nicely (integer or one decimal place)
  const displayFps = Number.isInteger(fps) ? fps.toString() : fps.toFixed(1);
  
  return (
    <div className="video-controller-time-display">
      {/* Current Time / Duration */}
      <div className="video-controller-time-section">
        <span className="video-controller-time">
          {formatTime(currentTime, fps, 'ms')}
        </span>
        
        <span className="video-controller-time-separator">/</span>
        
        <span className="video-controller-time">
          {formatTime(duration, fps, 'ms')}
        </span>
      </div>
      
      {/* Frame Number and FPS in a badge */}
      <div className="video-controller-frame-container">
        <div className="video-controller-frame">
          <Clock className="video-controller-frame-icon" />
          <span className="video-controller-frame-number">
            {String(frameNumber).padStart(5, '0')}
          </span>
          <span className="video-controller-fps">
            {displayFps}FPS
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoControllerTimeDisplay;