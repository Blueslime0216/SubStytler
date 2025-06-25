import React, { useState } from 'react';

interface VideoControllerSkipForwardButtonProps {
  isVideoLoaded: boolean;
  onSkip: () => void;
}

const VideoControllerSkipForwardButton: React.FC<VideoControllerSkipForwardButtonProps> = ({
  isVideoLoaded,
  onSkip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <div className="video-controller-button-wrapper">
      <button
        className={`video-controller-button ${!isVideoLoaded ? 'disabled' : ''}`}
        onClick={onSkip}
        disabled={!isVideoLoaded}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="5초 앞으로"
      >
        <svg
          className="video-controller-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 19L22 12L13 5V19Z" fill="currentColor" />
          <path d="M2 19L11 12L2 5V19Z" fill="currentColor" />
        </svg>
      </button>

      {showTooltip && (
        <div className="video-controller-tooltip">5초 앞으로</div>
      )}
    </div>
  );
};

export default VideoControllerSkipForwardButton; 