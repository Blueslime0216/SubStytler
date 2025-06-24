import React, { useState, useRef, useEffect } from 'react';
import { formatTime } from '../../../utils/timeUtils';

interface VideoControllerProgressBarProps {
  currentTime: number;
  duration: number;
  isVideoLoaded: boolean;
  setCurrentTime: (time: number) => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  fps: number;
}

const VideoControllerProgressBar: React.FC<VideoControllerProgressBarProps> = ({
  currentTime,
  duration,
  isVideoLoaded,
  setCurrentTime,
  onInteractionStart,
  onInteractionEnd,
  fps
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // 진행률 계산
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // 마우스 위치에서 시간 계산
  const getTimeFromPosition = (clientX: number): number => {
    if (!progressBarRef.current) return 0;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  };
  
  // 프로그레스바 클릭/드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVideoLoaded) return;
    
    e.preventDefault();
    onInteractionStart();
    setIsDragging(true);
    
    const newTime = getTimeFromPosition(e.clientX);
    setCurrentTime(newTime);
  };
  
  // 마우스 움직임에 따른 시간 업데이트
  const handleMouseMove = (e: MouseEvent) => {
    if (!progressBarRef.current) return;
    
    // 호버 시 시간 툴팁 표시
    const hoverTime = getTimeFromPosition(e.clientX);
    setHoverPosition(e.clientX);
    
    // 드래그 중이라면 실제 시간 변경
    if (isDragging && isVideoLoaded) {
      e.preventDefault();
      const newTime = Math.max(0, Math.min(duration, hoverTime));
      setCurrentTime(newTime);
    }
  };
  
  // 드래그 종료
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onInteractionEnd();
    }
  };
  
  // 마우스가 진행 바에서 벗어났을 때
  const handleMouseLeave = () => {
    setHoverPosition(null);
  };
  
  // 이벤트 리스너 등록/해제
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isVideoLoaded, duration]);
  
  // 툴팁 시간 계산 및 위치 계산
  const getTooltipTime = () => {
    if (hoverPosition === null) return 0;
    return getTimeFromPosition(hoverPosition);
  };
  
  const getTooltipPosition = () => {
    if (!progressBarRef.current || hoverPosition === null) return '0px';
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const position = hoverPosition - rect.left;
    return `${position}px`;
  };
  
  return (
    <div 
      ref={progressBarRef}
      className="video-controller-progress-container"
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
    >
      {/* 배경 트랙 */}
      <div className="video-controller-progress-track"></div>
      
      {/* 진행 상태 트랙 */}
      <div 
        className="video-controller-progress-fill"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      
      {/* 진행 인디케이터 */}
      <div 
        className="video-controller-progress-thumb"
        style={{ 
          left: `${progressPercentage}%`,
          transform: 'translateX(-50%)'
        }}
      ></div>
      
      {/* 시간 툴팁 */}
      {hoverPosition !== null && (
        <div 
          className="video-controller-progress-tooltip"
          style={{ 
            left: getTooltipPosition(),
            transform: 'translateX(-50%)'
          }}
        >
          {formatTime(getTooltipTime(), fps)}
        </div>
      )}
    </div>
  );
};

export default VideoControllerProgressBar; 