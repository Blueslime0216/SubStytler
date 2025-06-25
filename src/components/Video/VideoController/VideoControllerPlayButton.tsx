import React, { useState } from 'react';

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

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <div className="video-controller-button-wrapper">
      <button
        className={`video-controller-button ${!isVideoLoaded ? 'disabled' : ''}`}
        onClick={onToggle}
        disabled={!isVideoLoaded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isPlaying ? '일시정지' : '재생'}
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

      {showTooltip && (
        <div className="video-controller-tooltip">
          {isPlaying ? '일시정지' : '재생'}
        </div>
      )}
    </div>
  );
};

export default VideoControllerPlayButton; 