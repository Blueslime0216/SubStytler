import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { formatTime } from '../../../utils/timeUtils';
import { Portal } from '../../UI/Portal';

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
  const [tooltipCoords, setTooltipCoords] = useState<{left: number, top: number} | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
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
  
  // 프로그레스바 내부 이동 시
  const handleLocalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const newTime = getTimeFromPosition(e.clientX);
    setHoverPosition(e.clientX);
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      setTooltipCoords({
        left: e.clientX,
        top: rect.top,
      });
    }
    if (isDragging && isVideoLoaded) {
      setCurrentTime(Math.max(0, Math.min(duration, newTime)));
    }
  };

  // document mousemove는 드래그 중일 때만
  const handleDocMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newTime = getTimeFromPosition(e.clientX);
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
    setHoverPosition(e.clientX);
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      setTooltipCoords({
        left: e.clientX,
        top: rect.top,
      });
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
    setTooltipCoords(null);
  };
  
  // 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDocMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleDocMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isVideoLoaded, duration]);
  
  useLayoutEffect(() => {
    if (tooltipRef.current && tooltipCoords) {
      tooltipRef.current.style.left = `${tooltipCoords.left}px`;
      tooltipRef.current.style.top = `${tooltipCoords.top - 36}px`; // 36px 오프셋
    }
  }, [tooltipCoords]);
  
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
      onMouseMove={handleLocalMouseMove}
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
          left: `${progressPercentage}%`
        }}
      ></div>
      
      {/* 시간 툴팁 */}
      {tooltipCoords && (
        <Portal>
          <div
            ref={tooltipRef}
            className="video-controller-progress-tooltip"
            style={{
              position: 'fixed',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              visibility: tooltipCoords ? 'visible' : 'hidden',
            }}
          >
            {formatTime(getTooltipTime(), fps, false)}
          </div>
        </Portal>
      )}
    </div>
  );
};

export default VideoControllerProgressBar; 