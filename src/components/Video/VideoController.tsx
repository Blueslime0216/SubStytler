import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, Film } from 'lucide-react';
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
    <div className="video-controller-cinematic">
      {/* 시네마틱 프로그레스 바 */}
      <div className="px-10 pt-8 pb-6">
        <div 
          ref={progressBarRef}
          className={`progress-cinematic group ${
            isVideoLoaded ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onMouseDown={handleProgressBarMouseDown}
        >
          <div className="progress-track-cinematic" />
          
          <div 
            className="progress-fill-cinematic"
            style={{ width: `${progressPercentage}%` }}
          />
          
          <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
            isDragging ? 'bg-cinematic-gold/10' : 'bg-transparent group-hover:bg-cinematic-gold/5'
          }`} />
          
          <div 
            className={`progress-thumb-cinematic ${
              isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ 
              left: `${progressPercentage}%`,
              transition: isDragging ? 'none' : 'opacity 0.3s ease, transform 0.3s ease'
            }}
          />
          
          {isDragging && (
            <motion.div 
              className="tooltip-cinematic absolute -top-16"
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

      {/* 시네마틱 컨트롤들 */}
      <div className="flex items-center justify-between px-10 pb-8">
        {/* 왼쪽 컨트롤들 */}
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFrameBack}
            disabled={!isVideoLoaded}
            className="btn-cinematic-icon disabled:opacity-40"
            title="Previous Frame"
          >
            <SkipBack className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={!isVideoLoaded}
            className="btn-cinematic-primary p-5 disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFrameForward}
            disabled={!isVideoLoaded}
            className="btn-cinematic-icon disabled:opacity-40"
            title="Next Frame"
          >
            <SkipForward className="w-6 h-6" />
          </motion.button>

          {/* 시네마틱 볼륨 컨트롤 */}
          <div 
            className="flex items-center space-x-5"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMuteToggle}
              className="btn-cinematic-icon"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </motion.button>
            
            <motion.div 
              className="overflow-visible"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isVolumeHovered || isDraggingVolume ? 120 : 0,
                opacity: isVolumeHovered || isDraggingVolume ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div 
                ref={volumeBarRef}
                className="volume-cinematic flex items-center cursor-pointer"
                onMouseDown={handleVolumeBarMouseDown}
              >
                <div className="volume-track-cinematic" />
                
                <div 
                  className="volume-fill-cinematic"
                  style={{ width: `${volumePercentage}%` }}
                />
                
                <div 
                  className={`volume-thumb-cinematic ${
                    isDraggingVolume ? 'scale-125' : ''
                  }`}
                  style={{ 
                    left: `${volumePercentage}%`,
                    transition: isDraggingVolume ? 'none' : 'transform 0.1s ease'
                  }}
                />
                
                {isDraggingVolume && (
                  <motion.div 
                    className="tooltip-cinematic absolute -top-12"
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
        
        {/* 시네마틱 타임 디스플레이 */}
        <div className="text-center space-y-2">
          <div className="font-mono text-xl font-semibold text-cinematic-gold">
            {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
          </div>
          <div className="flex items-center justify-center space-x-6 caption-cinematic">
            <span>Frame {getCurrentFrame()} / {getTotalFrames()}</span>
            <span className="text-cinematic-gold">@{fps}fps</span>
            {isVideoLoaded && <span className="text-cinematic-gold">● Studio Ready</span>}
            {isDragging && <span className="text-cinematic-silver">● Seeking</span>}
          </div>
        </div>
        
        {/* 오른쪽 컨트롤들 */}
        <div className="flex items-center space-x-4">
          <Film className="w-6 h-6 text-cinematic-gold" />
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="btn-cinematic-icon hover-cinematic-glow"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};