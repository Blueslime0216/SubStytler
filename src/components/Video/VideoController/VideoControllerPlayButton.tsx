import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

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
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      {showTooltip && (
        <div className="video-controller-tooltip">
          {isPlaying ? 'Pause' : 'Play'}
        </div>
      )}
    </div>
  );
};

export default VideoControllerPlayButton;