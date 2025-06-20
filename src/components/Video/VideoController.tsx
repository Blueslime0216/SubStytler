import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, Cog, Gauge } from 'lucide-react';
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
    <div className="bg-panel border-t-2 border-copper-main relative">
      {/* 장식용 요소들 */}
      <div className="absolute top-1 left-4">
        <Cog className="w-3 h-3 text-brass gear-slow opacity-30" />
      </div>
      <div className="absolute top-1 right-8">
        <Cog className="w-2 h-2 text-copper gear-reverse opacity-25" />
      </div>
      
      {/* 리벳 장식 */}
      <div className="rivet-decoration top-1 left-1"></div>
      <div className="rivet-decoration top-1 right-1"></div>
      
      {/* 파이프 장식 */}
      <div className="pipe-decoration top-0 left-16 w-20 h-1"></div>
      <div className="pipe-decoration top-0 right-20 w-16 h-1"></div>

      {/* 프로그레스 바 */}
      <div className="px-6 pt-4 pb-3">
        <div 
          ref={progressBarRef}
          className={`progress-steampunk group relative ${
            isVideoLoaded ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onMouseDown={handleProgressBarMouseDown}
        >
          <div 
            className="progress-fill-steampunk"
            style={{ width: `${progressPercentage}%` }}
          />
          
          <div className={`absolute inset-0 rounded-lg transition-all duration-200 ${
            isDragging ? 'bg-brass/10' : 'bg-transparent group-hover:bg-brass/5'
          }`} />
          
          <div 
            className={`absolute w-4 h-4 bg-brass border-2 border-brass-dark rounded-full shadow-brass transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all ${
              isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ 
              left: `${progressPercentage}%`,
              transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.2s ease'
            }}
          />
          
          {isDragging && (
            <motion.div 
              className="absolute -top-8 bg-panel border border-copper-main rounded px-2 py-1 font-mono text-xs"
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

      {/* 컨트롤 */}
      <div className="flex items-center justify-between px-6 pb-4 relative z-10">
        {/* 왼쪽 컨트롤 */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFrameBack}
            disabled={!isVideoLoaded}
            className="btn-steampunk-icon disabled:opacity-40"
            title="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={!isVideoLoaded}
            className="btn-steampunk p-3 disabled:opacity-40"
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
            className="btn-steampunk-icon disabled:opacity-40"
            title="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>

          {/* 볼륨 컨트롤 */}
          <div 
            className="flex items-center space-x-3"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMuteToggle}
              className="btn-steampunk-icon"
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
                className="progress-steampunk h-2 cursor-pointer relative"
                onMouseDown={handleVolumeBarMouseDown}
              >
                <div 
                  className="progress-fill-steampunk h-full"
                  style={{ width: `${volumePercentage}%` }}
                />
                
                <div 
                  className={`absolute w-3 h-3 bg-brass border border-brass-dark rounded-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                    isDraggingVolume ? 'scale-125' : ''
                  }`}
                  style={{ 
                    left: `${volumePercentage}%`,
                    transition: isDraggingVolume ? 'none' : 'transform 0.1s ease'
                  }}
                />
                
                {isDraggingVolume && (
                  <motion.div 
                    className="absolute -top-8 bg-panel border border-copper-main rounded px-2 py-1 font-mono text-xs"
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
        
        {/* 시간 표시 */}
        <div className="text-center space-y-1">
          <div className="font-mono text-sm font-medium text-brass">
            {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
          </div>
          <div className="flex items-center justify-center space-x-3 font-mono text-xs text-muted">
            <span>Frame {getCurrentFrame()} / {getTotalFrames()}</span>
            <span>@{fps}fps</span>
            {isVideoLoaded && (
              <div className="flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-brass pressure-gauge" />
                <span className="text-brass">Ready</span>
              </div>
            )}
            {isDragging && (
              <div className="flex items-center space-x-1">
                <Cog className="w-3 h-3 text-brass gear" />
                <span className="text-brass">Seeking</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 오른쪽 컨트롤 */}
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="btn-steampunk-icon"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};