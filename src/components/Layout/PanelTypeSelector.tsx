import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';

interface PanelTypeSelectorProps {
  currentType: PanelType;
  onTypeChange: (newType: PanelType) => void;
  className?: string;
}

export const PanelTypeSelector: React.FC<PanelTypeSelectorProps> = ({
  currentType,
  onTypeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 패널 타입 목록 생성 (현재 타입을 중앙에 배치)
  const panelTypes = Object.keys(panelConfig) as PanelType[];
  const currentIndex = panelTypes.indexOf(currentType);
  
  // 현재 선택된 패널 타입의 설정
  const currentConfig = panelConfig[currentType];
  const CurrentIcon = currentConfig.icon;

  // 선택기가 열릴 때 현재 타입을 중앙에 배치
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(currentIndex);
    }
  }, [isOpen, currentIndex]);

  // 선택기 열기/닫기
  const toggleSelector = useCallback(() => {
    if (isAnimating) return;
    setIsOpen(prev => !prev);
  }, [isAnimating]);

  // 아이콘 선택 (클릭)
  const handleIconClick = useCallback((index: number) => {
    if (isAnimating) return;
    
    if (index === selectedIndex) {
      // 현재 선택된 아이콘을 다시 클릭 - 확정
      const selectedType = panelTypes[index];
      if (selectedType !== currentType) {
        onTypeChange(selectedType);
      }
      setIsOpen(false);
    } else {
      // 다른 아이콘 클릭 - 해당 아이콘으로 이동
      setIsAnimating(true);
      setSelectedIndex(index);
      setTimeout(() => setIsAnimating(false), 200); // 애니메이션 시간과 동기화
    }
  }, [selectedIndex, currentType, onTypeChange, panelTypes, isAnimating]);

  // 휠 스크롤 처리
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isOpen || isAnimating) return;
    
    e.preventDefault();
    setIsAnimating(true);
    
    const direction = e.deltaY > 0 ? 1 : -1;
    setSelectedIndex(prev => {
      const newIndex = prev + direction;
      return Math.max(0, Math.min(panelTypes.length - 1, newIndex));
    });
    
    setTimeout(() => setIsAnimating(false), 200);
  }, [isOpen, panelTypes.length, isAnimating]);

  // 외부 클릭 감지
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // ESC 키 처리
  useHotkeys('escape', () => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  // 외부 클릭 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen, handleOutsideClick]);

  // 애니메이션 설정 (30fps 기준)
  const animationConfig = {
    duration: 0.2, // 6프레임 (30fps 기준)
    ease: "easeOut" as const,
    type: "tween" as const
  };

  const iconSize = 48; // 각 아이콘의 너비
  const iconSpacing = 16; // 아이콘 간 간격
  const totalIconWidth = iconSize + iconSpacing;

  return (
    <div ref={selectorRef} className={`relative ${className}`}>
      {/* 메인 선택기 버튼 */}
      <motion.button
        onClick={toggleSelector}
        className="neu-btn-icon p-2 cursor-pointer neu-interactive relative overflow-hidden"
        title={`${currentConfig.title} - 클릭하여 패널 변경`}
        initial={false}
        animate={{
          width: isOpen ? 160 : 48, // 2배 확장
          borderRadius: isOpen ? 24 : 12,
          boxShadow: isOpen 
            ? `inset 4px 4px 12px rgba(13, 17, 23, 0.6), inset -2px -2px 8px rgba(45, 55, 72, 0.4)`
            : `4px 4px 12px rgba(13, 17, 23, 0.6), -2px -2px 8px rgba(45, 55, 72, 0.4)`,
          backgroundColor: isOpen 
            ? 'var(--neu-accent)'
            : 'var(--neu-base)'
        }}
        transition={animationConfig}
        style={{
          transition: 'all 0.2s ease',
          background: isOpen 
            ? 'linear-gradient(145deg, var(--neu-accent), var(--neu-surface))'
            : 'var(--neu-base)'
        }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            // 닫힌 상태: 현재 패널 아이콘만 표시
            <motion.div
              key="closed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={animationConfig}
              className="flex items-center justify-center"
            >
              <CurrentIcon className="w-4 h-4 neu-text-secondary transition-colors duration-200" />
            </motion.div>
          ) : (
            // 열린 상태: 아이콘 캐러셀
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animationConfig}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onWheel={handleWheel}
            >
              {/* 아이콘 캐러셀 컨테이너 */}
              <motion.div
                className="flex items-center absolute"
                animate={{
                  x: -selectedIndex * totalIconWidth + 56 // 중앙 정렬을 위한 오프셋
                }}
                transition={animationConfig}
                style={{
                  width: panelTypes.length * totalIconWidth,
                }}
              >
                {panelTypes.map((panelType, index) => {
                  const config = panelConfig[panelType];
                  const Icon = config.icon;
                  const isSelected = index === selectedIndex;
                  const isVisible = Math.abs(index - selectedIndex) <= 1; // 중앙과 좌우 1개씩만 표시

                  return (
                    <motion.div
                      key={panelType}
                      className="flex items-center justify-center cursor-pointer"
                      style={{
                        width: iconSize,
                        height: iconSize,
                        marginRight: index < panelTypes.length - 1 ? iconSpacing : 0
                      }}
                      onClick={() => handleIconClick(index)}
                      animate={{
                        scale: isSelected ? 1.2 : 1,
                        y: isSelected ? -2 : 0,
                        opacity: isVisible ? 1 : 0.3
                      }}
                      transition={animationConfig}
                      whileHover={{
                        scale: isSelected ? 1.25 : 1.05,
                        transition: { duration: 0.1 }
                      }}
                      whileTap={{
                        scale: isSelected ? 1.15 : 0.95,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <motion.div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'neu-shadow-inset' : 'neu-shadow-subtle'
                        }`}
                        style={{
                          background: isSelected 
                            ? 'var(--neu-primary)'
                            : 'var(--neu-base)',
                          boxShadow: isSelected
                            ? `inset 2px 2px 6px rgba(13, 17, 23, 0.6), inset -1px -1px 4px rgba(45, 55, 72, 0.4)`
                            : `2px 2px 6px rgba(13, 17, 23, 0.4), -1px -1px 4px rgba(45, 55, 72, 0.3)`
                        }}
                        animate={{
                          boxShadow: isSelected
                            ? `inset 2px 2px 6px rgba(13, 17, 23, 0.6), inset -1px -1px 4px rgba(45, 55, 72, 0.4), 0 0 8px rgba(99, 179, 237, 0.4)`
                            : `2px 2px 6px rgba(13, 17, 23, 0.4), -1px -1px 4px rgba(45, 55, 72, 0.3)`
                        }}
                        transition={animationConfig}
                      >
                        <Icon 
                          className={`w-4 h-4 transition-colors duration-200 ${
                            isSelected ? 'text-white' : 'neu-text-secondary'
                          }`} 
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* 좌우 그라데이션 마스크 */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-4 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, var(--neu-base), transparent)'
                }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-4 pointer-events-none"
                style={{
                  background: 'linear-gradient(270deg, var(--neu-base), transparent)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 선택기가 열렸을 때 상태 표시 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={animationConfig}
            className="absolute top-full left-0 mt-2 px-2 py-1 rounded-lg text-xs"
            style={{
              background: 'var(--neu-base)',
              boxShadow: 'var(--neu-shadow-subtle)',
              border: '1px solid rgba(45, 55, 72, 0.3)',
              color: 'var(--neu-text-secondary)',
              whiteSpace: 'nowrap',
              zIndex: 1000
            }}
          >
            {panelConfig[panelTypes[selectedIndex]]?.title || 'Unknown'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};