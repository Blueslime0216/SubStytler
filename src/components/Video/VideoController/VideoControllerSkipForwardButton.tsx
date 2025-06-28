import React, { useState, useRef } from 'react';
import { Portal } from '../../UI/Portal';

interface VideoControllerSkipForwardButtonProps {
  isVideoLoaded: boolean;
  onSkip: () => void;
}

const VideoControllerSkipForwardButton: React.FC<VideoControllerSkipForwardButtonProps> = ({
  isVideoLoaded,
  onSkip
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
            5초 앞으로
          </div>
        </Portal>
      )}
    </div>
  );
};

export default VideoControllerSkipForwardButton; 