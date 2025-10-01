import React, { useState, useRef } from 'react';
import { Pin, PinOff, Smartphone } from 'lucide-react';
import { Portal } from '../../UI/Portal';
import { useSubtitleVisibilityStore } from '../../../stores/subtitleVisibilityStore';
import { useUIStore } from '../../../stores/uiStore';

interface VideoControllerAdditionalButtonsProps {
  onSettings: () => void;
  onPinToggle: () => void;
  isPinned: boolean;
}

const VideoControllerAdditionalButtons: React.FC<VideoControllerAdditionalButtonsProps> = ({
  onSettings,
  onPinToggle,
  isPinned
}) => {
  const { isSubtitleVisible, toggleSubtitleVisibility } = useSubtitleVisibilityStore();
  const { isMobileMode, toggleMobileMode } = useUIStore();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null);
  const subtitleBtnRef = useRef<HTMLButtonElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);
  
  // 자막 토글
  const handleSubtitleToggle = () => {
    toggleSubtitleVisibility();
  };
  
  const handleMobileModeToggle = () => {
    toggleMobileMode();
  };

  // 툴팁 표시 관리
  const handleMouseEnter = (tooltipType: string) => {
    setShowTooltip(tooltipType);
    let ref: React.RefObject<HTMLButtonElement> | null = null;
    if (tooltipType === 'subtitle') ref = subtitleBtnRef;
    if (tooltipType === 'mobile') ref = mobileBtnRef;
    if (tooltipType === 'pin') ref = pinBtnRef;
    if (ref && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({
        left: rect.left + rect.width / 2,
        top: rect.top
      });
    }
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(null);
  };
  
  return (
    <div className="video-controller-additional-buttons">
      {/* 자막 토글 버튼 */}
      <div className="video-controller-button-wrapper">
        <button 
          ref={subtitleBtnRef}
          className={`video-controller-button ${isSubtitleVisible ? 'active' : ''}`}
          onClick={handleSubtitleToggle}
          onMouseEnter={() => handleMouseEnter('subtitle')}
          onMouseLeave={handleMouseLeave}
          title={isSubtitleVisible ? 'Hide subtitles' : 'Show subtitles'}
        >
          <svg className="video-controller-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M6 10H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        
        {showTooltip === 'subtitle' && tooltipPos && (
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
              {isSubtitleVisible ? '자막 끄기' : '자막 켜기'}
            </div>
          </Portal>
        )}
      </div>
      
      {/* 모바일 모드 버튼 */}
      <div className="video-controller-button-wrapper">
        <button 
          ref={mobileBtnRef}
          className={`video-controller-button ${isMobileMode ? 'active' : ''}`}
          onClick={handleMobileModeToggle}
          onMouseEnter={() => handleMouseEnter('mobile')}
          onMouseLeave={handleMouseLeave}
          title="Mobile mode"
        >
          <Smartphone className="video-controller-icon" width={20} height={20} />
        </button>
        
        {showTooltip === 'mobile' && tooltipPos && (
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
              {isMobileMode ? '모바일 모드 (활성)' : '모바일 모드'}
            </div>
          </Portal>
        )}
      </div>
      
      {/* 컨트롤러 고정 토글 버튼 */}
      <div className="video-controller-button-wrapper">
        <button 
          ref={pinBtnRef}
          className={`video-controller-button ${isPinned ? 'active' : ''}`}
          onClick={onPinToggle}
          onMouseEnter={() => handleMouseEnter('pin')}
          onMouseLeave={handleMouseLeave}
          title="Toggle controller lock"
        >
          {isPinned ? (
            <PinOff className="video-controller-icon" width={20} height={20} />
          ) : (
            <Pin className="video-controller-icon" width={20} height={20} />
          )}
        </button>
        {showTooltip === 'pin' && tooltipPos && (
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
              {isPinned ? '고정 해제' : '컨트롤러 고정'}
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
};

export default VideoControllerAdditionalButtons;