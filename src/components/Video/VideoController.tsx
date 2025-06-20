import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings } from 'lucide-react';
import { useTimelineStore } from '../../stores/timelineStore';
import { formatTime } from '../../utils/timeUtils';

interface VideoControllerProps {
  isVideoLoaded: boolean;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  onSettings: () => void;
}

export const VideoController: React.FC<VideoControllerProps> = ({
  isVideoLoaded,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onSettings
}) => {
  const { 
    currentTime, 
    isPlaying, 
    duration,
    fps,
    setPlaying, 
    setCurrentTime 
  } = useTimelineStore();

  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const handlePlayPause = () => {
    if (!isVideoLoaded) return;
    setPlaying(!isPlaying);
  };

  const handleFrameBack = () => {
    if (!isVideoLoaded) return;
    const frameDuration = 1000 / fps;
    setCurrentTime(Math.max(0, currentTime - frameDuration));
  };

  const handleFrameForward = () => {
    if (!isVideoLoaded) return;
    const frameDuration = 1000 / fps;
    setCurrentTime(Math.min(duration, currentTime + frameDuration));
  };

  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current) return currentTime;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * duration;
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVideoLoaded) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const newTime = getTimeFromPosition(e.clientX);
    setCurrentTime(newTime);
  };

  const handleProgressMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isVideoLoaded) return;
    
    e.preventDefault();
    const newTime = getTimeFromPosition(e.clientX);
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage;
  };

  const handleVolumeBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVolume(true);
    
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(newVolume);
  };

  const handleVolumeMouseMove = (e: MouseEvent) => {
    if (!isDraggingVolume) return;
    
    e.preventDefault();
    const newVolume = getVolumeFromPosition(e.clientX);
    onVolumeChange(Math.max(0, Math.min(1, newVolume)));
  };

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging, duration, isVideoLoaded]);

  React.useEffect(() => {
    if (isDraggingVolume) {
      document.addEventListener('mousemove', handleVolumeMouseMove);
      document.addEventListener('mouseup', handleVolumeMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleVolumeMouseMove);
        document.removeEventListener('mouseup', handleVolumeMouseUp);
      };
    }
  }, [isDraggingVolume]);

  const getCurrentFrame = () => Math.floor((currentTime * fps) / 1000);
  const getTotalFrames = () => Math.floor((duration * fps) / 1000);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  return (
    <div className="neu-video-controller">
      {/* Neumorphism Progress Bar - 트랜지션 제거 */}
      <div className="px-6 pt-4 pb-3">
        <div 
          ref={progressBarRef}
          className={`relative h-6 flex items-center group ${
            isVideoLoaded ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onMouseDown={handleProgressBarMouseDown}
        >
          {/* Progress Track */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-1 rounded-full transform -translate-y-1/2"
            style={{ 
              background: 'var(--neu-dark)',
              boxShadow: 'inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light)'
            }}
          />
          
          {/* Progress Fill - 트랜지션 제거 */}
          <div 
            className="absolute top-1/2 left-0 h-1 rounded-full transform -translate-y-1/2"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, var(--neu-primary), var(--neu-primary-light))',
              boxShadow: '0 0 4px var(--neu-primary)',
              transition: 'none' // 트랜지션 완전 제거
            }}
          />
          
          {/* Progress Thumb - 드래그 중일 때만 트랜지션 제거 */}
          <div 
            className={`absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 ${
              isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100 transition-all duration-200'
            }`}
            style={{ 
              left: `${progressPercentage}%`,
              background: 'var(--neu-base)',
              border: '2px solid var(--neu-primary)',
              boxShadow: 'var(--neu-shadow-1)',
              transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.2s ease' // 드래그 중에만 트랜지션 제거
            }}
          />
          
          {isDragging && (
            <motion.div 
              className="neu-card-small absolute -top-10 text-xs neu-text-primary"
              style={{ 
                left: `${progressPercentage}%`, 
                transform: 'translateX(-50%)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formatTime(currentTime, fps)}
            </motion.div>
          )}
        </div>
      </div>

      {/* Neumorphism Controls */}
      <div className="flex items-center justify-between px-6 pb-4">
        {/* Left Controls */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFrameBack}
            disabled={!isVideoLoaded}
            className="neu-btn-icon disabled:opacity-40"
            title="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={!isVideoLoaded}
            className="neu-btn-primary p-3 disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFrameForward}
            disabled={!isVideoLoaded}
            className="neu-btn-icon disabled:opacity-40"
            title="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>

          {/* Neumorphism Volume Control - 트랜지션 제거 */}
          <div 
            className="flex items-center space-x-3"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMuteToggle}
              className="neu-btn-icon"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>
            
            <motion.div 
              className="overflow-visible"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isVolumeHovered || isDraggingVolume ? 80 : 0,
                opacity: isVolumeHovered || isDraggingVolume ? 1 : 0
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div 
                ref={volumeBarRef}
                className="relative h-6 flex items-center cursor-pointer"
                onMouseDown={handleVolumeBarMouseDown}
                style={{ width: '80px' }}
              >
                {/* Volume Track */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-0.5 rounded-full transform -translate-y-1/2"
                  style={{ 
                    background: 'var(--neu-dark)',
                    boxShadow: 'inset 1px 1px 2px var(--neu-dark), inset -1px -1px 2px var(--neu-light)'
                  }}
                />
                
                {/* Volume Fill - 트랜지션 제거 */}
                <div 
                  className="absolute top-1/2 left-0 h-0.5 rounded-full transform -translate-y-1/2"
                  style={{ 
                    width: `${volumePercentage}%`,
                    background: 'linear-gradient(90deg, var(--neu-primary), var(--neu-primary-light))',
                    boxShadow: '0 0 3px var(--neu-primary)',
                    transition: 'none' // 트랜지션 완전 제거
                  }}
                />
                
                {/* Volume Thumb - 드래그 중일 때만 트랜지션 제거 */}
                <div 
                  className={`absolute top-1/2 w-3 h-3 rounded-full transform -translate-y-1/2 -translate-x-1/2 ${
                    isDraggingVolume ? 'scale-125' : ''
                  }`}
                  style={{ 
                    left: `${volumePercentage}%`,
                    background: 'var(--neu-base)',
                    border: '2px solid var(--neu-primary)',
                    boxShadow: 'var(--neu-shadow-1)',
                    transition: isDraggingVolume ? 'none' : 'transform 0.1s ease' // 드래그 중에만 트랜지션 제거
                  }}
                />
                
                {isDraggingVolume && (
                  <motion.div 
                    className="neu-card-small absolute -top-8 text-xs neu-text-primary whitespace-nowrap"
                    style={{ 
                      left: `${volumePercentage}%`, 
                      transform: 'translateX(-50%)'
                    }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {Math.round(volume * 100)}%
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Neumorphism Time Display */}
        <div className="text-center space-y-1">
          <div className="font-mono text-base font-medium neu-text-primary">
            {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
          </div>
          <div className="flex items-center justify-center space-x-3 neu-caption">
            <span>Frame {getCurrentFrame()} / {getTotalFrames()}</span>
            <span>@{fps}fps</span>
            {isVideoLoaded && <span style={{ color: 'var(--neu-success)' }}>● Ready</span>}
            {isDragging && <span style={{ color: 'var(--neu-primary)' }}>● Seeking</span>}
          </div>
        </div>
        
        {/* Right Controls */}
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="neu-btn-icon neu-hover-lift"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};