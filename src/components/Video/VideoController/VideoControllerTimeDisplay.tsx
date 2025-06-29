import React, { useState, useRef } from 'react';
import { formatTime } from '../../../utils/timeUtils';
import { Portal } from '../../UI/Portal';
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
  const [showTooltip, setShowTooltip] = useState(false);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null);
  
  // Format FPS value to display nicely (integer or one decimal place)
  const displayFps = Number.isInteger(fps) ? fps.toString() : fps.toFixed(1);
  
  // Handle mouse enter for tooltip
  const handleMouseEnter = () => {
    if (timeDisplayRef.current) {
      const rect = timeDisplayRef.current.getBoundingClientRect();
      setTooltipPos({
        left: rect.left + rect.width / 2,
        top: rect.top
      });
      setShowTooltip(true);
    }
  };
  
  // Handle mouse leave for tooltip
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  
  return (
    <div 
      ref={timeDisplayRef}
      className="video-controller-time-display"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Current Time / Duration */}
      <span className="video-controller-time">
        {formatTime(currentTime, fps, 'ms')}
      </span>
      
      <span className="video-controller-time-separator">/</span>
      
      <span className="video-controller-time">
        {formatTime(duration, fps, 'ms')}
      </span>
      
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
      
      {/* Detailed Tooltip */}
      {showTooltip && tooltipPos && (
        <Portal>
          <div
            className="video-controller-tooltip video-time-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top - 60,
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
          >
            <div className="video-time-tooltip-content">
              <div className="video-time-tooltip-row">
                <span className="video-time-tooltip-label">Current:</span>
                <span className="video-time-tooltip-value">{formatTime(currentTime, fps, 'frames')}</span>
              </div>
              <div className="video-time-tooltip-row">
                <span className="video-time-tooltip-label">Frame:</span>
                <span className="video-time-tooltip-value">{frameNumber}</span>
              </div>
              <div className="video-time-tooltip-row">
                <span className="video-time-tooltip-label">FPS:</span>
                <span className="video-time-tooltip-value">{displayFps}</span>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default VideoControllerTimeDisplay;