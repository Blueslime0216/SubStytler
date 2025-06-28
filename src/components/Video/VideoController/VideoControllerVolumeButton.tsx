import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Portal } from '../../UI/Portal';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null);
  
  // 볼륨에 따른 아이콘 결정
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="video-controller-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
          <path d="M23 9L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 9L23 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    } else if (volume < 0.5) {
      return (
        <svg className="video-controller-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
          <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    } else {
      return (
        <svg className="video-controller-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
          <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  };
  
  const getVolumeTooltipText = () => {
    if (isMuted) return '음소거 해제';
    if (volume === 0) return '음소거';
    if (volume < 0.5) return '낮은 볼륨';
    return '높은 볼륨';
  };
  
  // 볼륨 컨트롤러 토글
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
  
  // 볼륨 위치 계산
  const getVolumeFromPosition = (clientX: number): number => {
    if (!volumeBarRef.current) return volume;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage;
  };
  
  // 볼륨 조절
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
      
      // 볼륨 드래그가 끝나고 마우스가 볼륨 영역에서 벗어났다면 닫기
      const isMouseOver = volumeBarRef.current?.matches(':hover');
      if (!isMouseOver) {
        setIsVolumeHovered(false);
        onInteractionEnd();
      }
    }
  };
  
  // 볼륨 버튼 호버 툴팁
  const handleButtonMouseEnter = () => {
    setShowVolumeTooltip(true);
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        left: rect.left + rect.width / 2,
        top: rect.top
      });
    }
  };
  
  const handleButtonMouseLeave = () => setShowVolumeTooltip(false);
  
  // 이벤트 리스너 등록/해제
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
      {/* 볼륨 버튼 */}
      <div className="video-controller-button-wrapper">
        <button 
          ref={buttonRef}
          className="video-controller-button"
          onClick={onMuteToggle}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {getVolumeIcon()}
        </button>
        
        {/* 버튼 호버 시 나타나는 툴팁 */}
        {showVolumeTooltip && tooltipPos && (
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
              {getVolumeTooltipText()}
            </div>
          </Portal>
        )}
      </div>
      
      {/* 볼륨 슬라이더 - Framer Motion 으로 애니메이션 처리 */}
      <motion.div
        ref={volumeBarRef as React.RefObject<HTMLDivElement>}
        className="video-controller-volume-slider"
        animate={{
          width: (isVolumeHovered || isDragging) ? 80 : 0,
          opacity: (isVolumeHovered || isDragging) ? 1 : 0,
          x: (isVolumeHovered || isDragging) ? 0 : -10,
          overflow: 'visible'
        }}
        transition={{ 
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
          width: { duration: 0.5, ease: [0.34, 0.69, 0.1, 1] }
        }}
        style={{ 
          marginLeft: 4,
          originX: 0,
          transformOrigin: "left center"
        }}
        onMouseDown={handleVolumeBarMouseDown}
        onMouseUp={handleVolumeMouseUp}
        onClick={(e)=>e.stopPropagation()}
      >
        {/* 고정 너비의 내부 컨테이너 - 와이퍼 효과를 위해 */}
        <div style={{ 
          width: "80px",
          position: "relative",
          height: "100%"
        }}>
          {/* 트랙 배경 */}
          <div className="video-controller-volume-track-container">
            <div className="video-controller-volume-track"></div>
            {/* 볼륨 진행 바 */}
            <div className="video-controller-volume-fill" style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div>
            {/* 볼륨 썸 */}
            <div className="video-controller-volume-thumb" style={{ left: `${isMuted ? 0 : volume * 100}%` }}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoControllerVolumeButton; 