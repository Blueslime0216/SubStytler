import React, { useState, useRef } from 'react';
import { Pin, PinOff, Settings } from 'lucide-react';
import { Portal } from '../../UI/Portal';

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
  const [isSubtitleOn, setIsSubtitleOn] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{left: number, top: number} | null>(null);
  const subtitleBtnRef = useRef<HTMLButtonElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);
  
  // 자막 토글
  const handleSubtitleToggle = () => {
    setIsSubtitleOn(!isSubtitleOn);
    // 여기에 자막 토글 기능 구현 (아직 구현하지 않음)
  };
  
  // 툴팁 표시 관리
  const handleMouseEnter = (tooltipType: string) => {
    setShowTooltip(tooltipType);
    let ref: React.RefObject<HTMLButtonElement> | null = null;
    if (tooltipType === 'subtitle') ref = subtitleBtnRef;
    if (tooltipType === 'settings') ref = settingsBtnRef;
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
          className={`video-controller-button ${isSubtitleOn ? 'active' : ''}`}
          onClick={handleSubtitleToggle}
          onMouseEnter={() => handleMouseEnter('subtitle')}
          onMouseLeave={handleMouseLeave}
          title={isSubtitleOn ? '자막 끄기' : '자막 켜기'}
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
              {isSubtitleOn ? '자막 끄기' : '자막 켜기'}
            </div>
          </Portal>
        )}
      </div>
      
      {/* 설정 버튼 */}
      <div className="video-controller-button-wrapper">
        <button 
          ref={settingsBtnRef}
          className="video-controller-button"
          onClick={onSettings}
          onMouseEnter={() => handleMouseEnter('settings')}
          onMouseLeave={handleMouseLeave}
          title="설정"
        >
          <Settings className="video-controller-icon" width={20} height={20} />
        </button>
        
        {showTooltip === 'settings' && tooltipPos && (
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
              설정
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
          title="컨트롤러 고정/해제"
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