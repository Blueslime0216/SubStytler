import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VideoControllerVolumeButtonProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}

const VideoControllerVolumeButton: React.FC<VideoControllerVolumeButtonProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onInteractionStart,
  onInteractionEnd
}) => {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4" />;
    } else if (volume < 0.5) {
      return <Volume1 className="w-4 h-4" />;
    } else {
      return <Volume2 className="w-4 h-4" />;
    }
  };
  
  const getVolumeTooltipText = () => {
    if (isMuted) return 'Unmute';
    if (volume === 0) return 'Mute';
    return `Volume ${Math.round(volume * 100)}%`;
  };
  
  const handleVolumeMouseEnter = () => {
    setIsVolumeHovered(true);
    onInteractionStart();
  };
  
  const handleVolumeMouseLeave = () => {
    if (!isDragging) {
      setIsVolumeHovered(false);
      onInteractionEnd();
    }
  };
  
  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage;
  };
  
  const handleVolumeBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(newVolume);
  };
  
  const handleVolumeMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(Math.max(0, Math.min(1, newVolume)));
  };
  
  const handleVolumeMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      const isMouseOver = volumeBarRef.current?.matches(':hover');
      if (!isMouseOver) {
        setIsVolumeHovered(false);
        onInteractionEnd();
      }
    }
  };
  
  const handleButtonMouseEnter = () => {
    setShowVolumeTooltip(true);
  };
  
  const handleButtonMouseLeave = () => {
    setShowVolumeTooltip(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
      };
    }
  }, [isDragging]);
  
  return (
    <div 
      className="video-controller-volume-container"
      onMouseEnter={handleVolumeMouseEnter}
      onMouseLeave={handleVolumeMouseLeave}
    >
      <div className="video-controller-button-wrapper">
        <button 
          className="video-controller-button"
          onClick={onMuteToggle}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {getVolumeIcon()}
        </button>
        
        {showVolumeTooltip && (
          <div className="video-controller-tooltip">
            {getVolumeTooltipText()}
          </div>
        )}
      </div>
      
      {(isVolumeHovered || isDragging) && (
        <div
          ref={volumeBarRef}
          className="video-controller-volume-slider"
          onMouseDown={handleVolumeBarMouseDown}
          onMouseUp={handleVolumeMouseUp}
        >
          <div className="video-controller-volume-track-container">
            <div className="video-controller-volume-track" />
            <div 
              className="video-controller-volume-fill" 
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
            <div 
              className="video-controller-volume-thumb" 
              style={{ left: `${isMuted ? 0 : volume * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoControllerVolumeButton;