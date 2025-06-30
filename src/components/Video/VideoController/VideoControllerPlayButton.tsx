import React, { useState, useRef } from 'react';
import { Portal } from '../../UI/Portal';

interface VideoControllerPlayButtonProps {
  isPlaying: boolean;
  isVideoLoaded: boolean;
  onToggle: () => void;
}

const VideoControllerPlayButton: React.FC<VideoControllerPlayButtonProps> = ({
  isPlaying,
  isVideoLoaded,
  onToggle
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        left: rect.left + rect.width / 2,
        top: rect.top
      });
    }
  };
  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <div className="video-controller-button-wrapper">
      <button
        ref={buttonRef}
        className={`video-controller-button ${!isVideoLoaded ? 'disabled' : ''}`}
        onClick={onToggle}
        disabled={!isVideoLoaded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg 
            className="video-controller-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg 
            className="video-controller-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M5 3L19 12L5 21V3Z" 
              fill="currentColor" 
            />
          </svg>
        )}
      </button>

      {showTooltip && tooltipPos && (
        <Portal>
          <div
            className="video-controller-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top - 40,
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default VideoControllerPlayButton; 