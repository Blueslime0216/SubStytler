import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { formatTime } from '../../utils/timeUtils';
import VideoControllerPlayButton from './VideoController/VideoControllerPlayButton';
import VideoControllerProgressBar from './VideoController/VideoControllerProgressBar';
import VideoControllerVolumeButton from './VideoController/VideoControllerVolumeButton';
import VideoControllerTimeDisplay from './VideoController/VideoControllerTimeDisplay';
import VideoControllerAdditionalButtons from './VideoController/VideoControllerAdditionalButtons';
import VideoControllerSkipForwardButton from './VideoController/VideoControllerSkipForwardButton';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoControllerProps {
  isVideoLoaded: boolean;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSettings: () => void;
  parentRef?: React.RefObject<HTMLElement>;
}

export const VideoController: React.FC<VideoControllerProps> = ({
  isVideoLoaded,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onSettings,
  parentRef
}) => {
  const { 
    currentTime, 
    isPlaying, 
    duration,
    fps,
    setPlaying, 
    setCurrentTime 
  } = useTimelineStore();

  const [isVisible, setIsVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const controllerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const togglePin = () => setIsPinned(p => !p);

  // modify visibility logic: ensure always visible when pinned
  const safeSetVisible = (v:boolean)=>{
    if(isPinned){
      setIsVisible(true);
    } else {
      setIsVisible(v);
    }
  };

  // 마우스 진입 시 컨트롤러 표시
  const handleMouseEnter = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // 마우스 떠날 때 컨트롤러 숨기기 (지연 처리)
  const handleMouseLeave = () => {
    if (isInteracting || isPinned) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = window.setTimeout(() => {
      if(!isPinned) setIsVisible(false);
      hideTimeoutRef.current = null;
    }, 100); // 0.1초 후 사라짐
  };

  // 컨트롤러와 상호작용 중일 때 숨김 방지
  const handleInteractionStart = () => {
    setIsInteracting(true);
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
  };

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    if (!isVideoLoaded) return;
    setPlaying(!isPlaying);
  };

  // 5초 앞으로 이동
  const handleSkipForward = () => {
    if (!isVideoLoaded) return;
    setCurrentTime(Math.min(duration, currentTime + 5000));
  };

  // 부모 영역(비디오 영역) 호버 감지
  useEffect(() => {
    if (!parentRef?.current) return;
    const el = parentRef.current;
    const handleEnter = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsVisible(true);
  };
    const handleLeave = () => {
      if (isInteracting || isPinned) return;
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = window.setTimeout(() => {
        if(!isPinned) setIsVisible(false);
        hideTimeoutRef.current = null;
      }, 100);
    };
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [parentRef, isInteracting, isPinned]);

  // 글로벌 마우스 위치 기반 가드 – 커서가 비디오 영역이나 컨트롤러 위에 있으면 항상 보이도록
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!parentRef?.current || !controllerRef.current) return;
      const insideParent = parentRef.current.contains(e.target as Node);
      const insideController = controllerRef.current.contains(e.target as Node);
      if (insideParent || insideController) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
      }
    };
    document.addEventListener('mousemove', handleGlobalMove);
    return () => document.removeEventListener('mousemove', handleGlobalMove);
  }, [parentRef]);
      
  // 클린업 함수
  useEffect(() => {
      return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          ref={controllerRef}
          className="video-controller-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
            >
          <VideoControllerProgressBar 
            currentTime={currentTime}
            duration={duration}
            isVideoLoaded={isVideoLoaded}
            setCurrentTime={setCurrentTime}
            onInteractionStart={handleInteractionStart}
            onInteractionEnd={handleInteractionEnd}
            fps={fps}
          />
          
          <div className="video-controller-controls">
            <div className="video-controller-left">
              <VideoControllerPlayButton 
                isPlaying={isPlaying} 
                isVideoLoaded={isVideoLoaded}
                onToggle={handlePlayPause}
              />
              
              <VideoControllerSkipForwardButton
                isVideoLoaded={isVideoLoaded}
                onSkip={handleSkipForward}
              />
              
              <VideoControllerVolumeButton 
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={onVolumeChange}
                onMuteToggle={onMuteToggle}
                onInteractionStart={handleInteractionStart}
                onInteractionEnd={handleInteractionEnd}
              />
              
              <VideoControllerTimeDisplay 
                currentTime={currentTime}
                duration={duration}
                frameNumber={Math.floor((currentTime * fps) / 1000)}
                fps={fps}
              />
          </div>
          
            <div className="video-controller-right">
              <VideoControllerAdditionalButtons
                onSettings={onSettings}
                onPinToggle={togglePin}
                isPinned={isPinned}
              />
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};