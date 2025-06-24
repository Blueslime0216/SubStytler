import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings, Maximize, RotateCcw } from 'lucide-react';
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
  onFullscreen,
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

  // 정확한 시간 계산
  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current) return currentTime;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const padding = 12; // CSS의 left/right 패딩과 정확히 일치
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

  // 볼륨 계산
  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const padding = 6; // CSS의 left/right 패딩과 정확히 일치
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

  // 퍼센티지 계산
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  // 썸 위치 계산
  const getThumbPosition = () => {
    if (!progressBarRef.current) return '12px'; // 기본 패딩 위치
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const padding = 12;
    const trackWidth = rect.width - (padding * 2);
    const thumbPosition = padding + (progressPercentage / 100) * trackWidth;
    return `${thumbPosition}px`;
  };

  const getVolumeThumbPosition = () => {
    if (!volumeBarRef.current) return '6px'; // 기본 패딩 위치
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const padding = 6;
    const trackWidth = rect.width - (padding * 2);
    const thumbPosition = padding + (volumePercentage / 100) * trackWidth;
    return `${thumbPosition}px`;
  };

  return (
    <div className="neu-video-controller">
      {/* 컴팩트한 시간 및 프레임 정보 */}
      <div className="flex items-center justify-between px-3 py-1 neu-bg-subtle rounded-md mx-3 mb-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono neu-text-secondary">@{fps}fps</span>
          <span className="font-mono neu-text-secondary">|</span>
          <span className="font-mono neu-text-primary">F: {getCurrentFrame()}/{getTotalFrames()}</span>
        </div>
        <div className="font-mono text-xs neu-text-primary">
          {formatTime(currentTime, fps)} / {formatTime(duration, fps)}
        </div>
      </div>
      
      {/* 향상된 재생바 */}
      <div className="px-3 pb-2">
        <div 
          ref={progressBarRef}
          className="neu-progress-container relative h-10 flex items-center"
          onMouseDown={handleProgressBarMouseDown}
        >
          {/* 트랙 */}
          <div className="neu-progress-track" />
          
          {/* 진행 바 */}
          <div 
            className="neu-progress-fill"
            style={{ width: `calc(${progressPercentage}% + 0px)` }}
          />
          
          {/* 썸 */}
          <div 
            className="neu-progress-thumb"
            style={{ 
              left: getThumbPosition(),
              transition: isDragging ? 'none' : 'left 0.1s linear'
            }}
          />
          
          {/* 드래그 중 시간 표시 - 작게 표시 */}
          {isDragging && (
            <motion.div 
              className="neu-card-micro absolute -top-8 text-xs neu-text-primary font-mono font-semibold"
              style={{ 
                left: getThumbPosition(),
                transform: 'translateX(-50%)'
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {formatTime(currentTime, fps)}
            </motion.div>
          )}
        </div>
      </div>

      {/* 컨트롤 버튼 레이아웃 개선 */}
      <div className="flex items-center justify-between px-3 pb-3">
        {/* 왼쪽 컨트롤 그룹 */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handlePlayPause}
            disabled={!isVideoLoaded}
            className="neu-btn-primary p-3 disabled:opacity-40 neu-interactive"
            title={isPlaying ? '일시정지 (Space)' : '재생 (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </motion.button>
          
          <div className="flex items-center space-x-1">
            <motion.button
              onClick={handleFrameBack}
              disabled={!isVideoLoaded}
              className="neu-btn-icon-sm disabled:opacity-40 neu-interactive"
              title="이전 프레임 (Left Arrow)"
            >
              <SkipBack className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={handleFrameForward}
              disabled={!isVideoLoaded}
              className="neu-btn-icon-sm disabled:opacity-40 neu-interactive"
              title="다음 프레임 (Right Arrow)"
            >
              <SkipForward className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* 중앙 컨트롤 그룹 - 비워둠 */}
        <div></div>
        
        {/* 오른쪽 컨트롤 그룹 */}
        <div className="flex items-center space-x-2">
          <div 
            className="flex items-center"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <motion.button
              onClick={onMuteToggle}
              className="neu-btn-icon-sm neu-interactive"
              title={isMuted ? '음소거 해제' : '음소거'}
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
                className="neu-volume-container relative h-8 flex items-center cursor-pointer neu-interactive"
                onMouseDown={handleVolumeBarMouseDown}
                style={{ width: '80px' }}
              >
                {/* 볼륨 트랙 */}
                <div className="neu-volume-track" />
                
                {/* 볼륨 진행 바 */}
                <div 
                  className="neu-volume-fill"
                  style={{ width: `calc(${volumePercentage}% + 0px)` }}
                />
                
                {/* 볼륨 썸 */}
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
                    className="neu-card-micro absolute -top-6 text-xs neu-text-primary font-mono whitespace-nowrap"
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
          
          <motion.button
            onClick={onSettings}
            className="neu-btn-icon-sm neu-interactive"
            title="비디오 설정"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={onFullscreen}
            className="neu-btn-icon-sm neu-interactive"
            title="전체화면"
          >
            <Maximize className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};