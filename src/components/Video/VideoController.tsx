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

  // 🎯 정확한 시간 계산 - 패딩 고려
  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current) return currentTime;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const padding = 20; // CSS의 left/right 패딩과 정확히 일치
    const trackWidth = rect.width - (padding * 2); // 실제 트랙 너비
    const x = Math.max(0, Math.min(clientX - rect.left - padding, trackWidth));
    const percentage = trackWidth > 0 ? x / trackWidth : 0;
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

  // 🎯 정확한 볼륨 계산 - 패딩 고려
  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const padding = 8; // CSS의 left/right 패딩과 정확히 일치
    const trackWidth = rect.width - (padding * 2); // 실제 트랙 너비
    const x = Math.max(0, Math.min(clientX - rect.left - padding, trackWidth));
    const percentage = trackWidth > 0 ? x / trackWidth : 0;
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

  // 🎯 정확한 퍼센티지 계산 - 패딩 고려
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  // 🎯 썸 위치 계산 - 패딩과 트랙 너비 정확히 고려
  const getThumbPosition = () => {
    if (!progressBarRef.current) return '20px'; // 기본 패딩 위치
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const padding = 20;
    const trackWidth = rect.width - (padding * 2);
    const thumbPosition = padding + (progressPercentage / 100) * trackWidth;
    return `${thumbPosition}px`;
  };

  const getVolumeThumbPosition = () => {
    if (!volumeBarRef.current) return '8px'; // 기본 패딩 위치
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const padding = 8;
    const trackWidth = rect.width - (padding * 2);
    const thumbPosition = padding + (volumePercentage / 100) * trackWidth;
    return `${thumbPosition}px`;
  };

  return (
    <div className="neu-video-controller">
      <div className="px-10 pt-8 pb-6">
        <div 
          ref={progressBarRef}
          className={`neu-progress-container relative h-16 flex items-center group ${
            isVideoLoaded ? 'cursor-pointer neu-interactive' : 'cursor-not-allowed'
          }`}
          onMouseDown={handleProgressBarMouseDown}
          title={isVideoLoaded ? "Click to seek video position" : "Load a video to enable seeking"}
        >
          {/* 트랙 */}
          <div className="neu-progress-track" />
          
          {/* 진행 바 */}
          <div 
            className="neu-progress-fill"
            style={{ width: `calc(${progressPercentage}% + 0px)` }}
          />
          
          {/* 썸 - 정확한 위치 */}
          <div 
            className={`neu-progress-thumb ${
              isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ 
              left: getThumbPosition(),
              transition: isDragging ? 'none' : 'opacity 0.2s ease'
            }}
          />
          
          {/* 드래그 중 시간 표시 */}
          {isDragging && (
            <motion.div 
              className="neu-card-micro absolute -top-16 text-sm neu-text-primary font-mono font-semibold"
              style={{ 
                left: getThumbPosition(),
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

      <div className="flex items-center justify-between px-10 pb-8">
        <div className="flex items-center space-x-5">
          <motion.button
            onClick={handleFrameBack}
            disabled={!isVideoLoaded}
            className="neu-btn-icon disabled:opacity-40 neu-interactive"
            title="Previous Frame (Left Arrow)"
          >
            <SkipBack className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={handlePlayPause}
            disabled={!isVideoLoaded}
            className="neu-btn-primary p-5 disabled:opacity-40 neu-interactive"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7" />
            )}
          </motion.button>
          
          <motion.button
            onClick={handleFrameForward}
            disabled={!isVideoLoaded}
            className="neu-btn-icon disabled:opacity-40 neu-interactive"
            title="Next Frame (Right Arrow)"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>

          <div 
            className="flex items-center space-x-4"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <motion.button
              onClick={onMuteToggle}
              className="neu-btn-icon neu-interactive"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>
            
            <motion.div 
              className="overflow-visible"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isVolumeHovered || isDraggingVolume ? 120 : 0,
                opacity: isVolumeHovered || isDraggingVolume ? 1 : 0
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div 
                ref={volumeBarRef}
                className="neu-volume-container relative h-12 flex items-center cursor-pointer neu-interactive"
                onMouseDown={handleVolumeBarMouseDown}
                style={{ width: '120px' }}
                title="Adjust volume"
              >
                {/* 볼륨 트랙 */}
                <div className="neu-volume-track" />
                
                {/* 볼륨 진행 바 */}
                <div 
                  className="neu-volume-fill"
                  style={{ width: `calc(${volumePercentage}% + 0px)` }}
                />
                
                {/* 볼륨 썸 - 정확한 위치 */}
                <div 
                  className="neu-volume-thumb"
                  style={{ 
                    left: getVolumeThumbPosition(),
                    transition: isDraggingVolume ? 'none' : 'transform 0.1s ease'
                  }}
                />
                
                {/* 드래그 중 볼륨 표시 */}
                {isDraggingVolume && (
                  <motion.div 
                    className="neu-card-micro absolute -top-14 text-sm neu-text-primary font-mono font-semibold whitespace-nowrap"
                    style={{ 
                      left: getVolumeThumbPosition(),
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
        
        <div className="text-center space-y-3">
          <div className="font-mono text-xl font-bold neu-text-primary">
            {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
          </div>
          <div className="flex items-center justify-center space-x-6 neu-caption">
            <span className="font-semibold">Frame {getCurrentFrame()} / {getTotalFrames()}</span>
            <span className="font-semibold">@{fps}fps</span>
            {isVideoLoaded && <span className="neu-text-accent font-semibold">● Ready</span>}
            {isDragging && <span style={{ color: 'var(--neu-primary)' }} className="font-semibold">● Seeking</span>}
          </div>
        </div>
        
        <div className="flex items-center">
          <motion.button
            onClick={onSettings}
            className="neu-btn-icon neu-interactive"
            title="Video Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};