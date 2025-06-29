import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { PanelType } from '../../types/project';
import { panelConfig } from '../../config/panelConfig';
import { Portal } from '../UI/Portal';

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
  const [hoveredPanelType, setHoveredPanelType] = useState<PanelType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);

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
    if (isAnimating) return; // 이동 중 반복 입력 방지
    
    setIsAnimating(true);
    setSelectedIndex(index);
    
    // 선택한 패널 타입으로 변경
    const selectedType = panelTypes[index];
    if (selectedType !== currentType) {
      onTypeChange(selectedType);
    }
    
    // 짧은 애니메이션 후 선택기 닫기
    setTimeout(() => {
      setIsAnimating(false);
      setIsOpen(false);
    }, 200);
  }, [selectedIndex, currentType, onTypeChange, panelTypes, isAnimating]);

  // 툴팁 표시 핸들러
  const handleIconMouseEnter = useCallback((e: React.MouseEvent, panelType: PanelType) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    // Capture the bounding rect immediately to avoid null reference errors
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setHoveredPanelType(panelType);
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
    }, 200); // 200ms 지연
  }, []);

  // 툴팁 숨김 핸들러
  const handleIconMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setHoveredPanelType(null);
    setTooltipPosition(null);
  }, []);

  // 휠 스크롤 처리
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isOpen || isAnimating) return;

    e.preventDefault();

    const direction = e.deltaY > 0 ? 1 : -1;
    const proposedIndex = selectedIndex + direction;

    // 범위를 벗어나면 무시 → "끝"에서 더 이상 스크롤되지 않음
    if (proposedIndex < 0 || proposedIndex > panelTypes.length - 1) {
      return;
    }

    setIsAnimating(true);
    setSelectedIndex(proposedIndex);
    setTimeout(() => setIsAnimating(false), 200);
  }, [isOpen, panelTypes.length, isAnimating, selectedIndex]);

  // 키보드 내비게이션
  useHotkeys('left', () => {
    if (!isOpen || isAnimating) return;
    const proposedIndex = selectedIndex - 1;
    if (proposedIndex >= 0) {
      setIsAnimating(true);
      setSelectedIndex(proposedIndex);
      setTimeout(() => setIsAnimating(false), 200);
    }
  }, { enabled: isOpen });

  useHotkeys('right', () => {
    if (!isOpen || isAnimating) return;
    const proposedIndex = selectedIndex + 1;
    if (proposedIndex < panelTypes.length) {
      setIsAnimating(true);
      setSelectedIndex(proposedIndex);
      setTimeout(() => setIsAnimating(false), 200);
    }
  }, { enabled: isOpen });

  useHotkeys('enter', () => {
    if (!isOpen || isAnimating) return;
    const selectedType = panelTypes[selectedIndex];
    if (selectedType !== currentType) {
      onTypeChange(selectedType);
    }
    setIsOpen(false);
  }, { enabled: isOpen });

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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // 애니메이션 설정
  const animationConfig = {
    duration: 0.2,
    ease: "easeOut" as const,
    type: "tween" as const
  };

  // 아이콘 및 간격 설정
  const iconSize = 28; // 더 작게 조정
  const iconSpacing = 6; // 더 작게 조정
  const totalIconWidth = iconSize + iconSpacing;
  const openWidth = 160; // 더 작게 조정
  const centerOffset = 64; // 더 작게 조정

  return (
    <div ref={selectorRef} className={`relative ${className}`}>
      {/* 메인 선택기 버튼 */}
      <motion.button
        onClick={toggleSelector}
        className={`relative cursor-pointer flex items-center justify-center panel-selector-button${isOpen ? ' open' : ''}`}
        title={`${currentConfig.title} - 클릭하여 패널 변경`}
        initial={false}
        animate={{
          width: isOpen ? openWidth : 32, // 더 작게 조정
          height: 32, // 더 작게 조정
          borderRadius: isOpen ? 8 : 4, // 더 작게 조정
        }}
        transition={animationConfig}
        style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
        whileHover={{ 
          filter: 'brightness(1.05)',
          borderColor: 'var(--light-surface-color)'
        }}
        whileTap={{ scale: 0.98 }}
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
              className="flex items-center justify-center w-full h-full"
            >
              <CurrentIcon className="w-4 h-4 text-text-primary transition-colors duration-200" />
            </motion.div>
          ) : (
            // 열린 상태: 아이콘 캐러셀
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animationConfig}
              className={"relative w-full h-full flex items-center justify-center panel-selector-carousel open"}
              style={{ overflow: 'hidden' }}
              onWheel={handleWheel}
            >
              {/* 그림자 레이어 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={animationConfig}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 6,
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: 'var(--shadow-inset)',
                }}
              />
              {/* 아이콘 캐러셀 컨테이너 */}
              <motion.div
                className="flex items-center absolute panel-selector-icons"
                animate={{
                  x: -selectedIndex * totalIconWidth + centerOffset
                }}
                transition={animationConfig}
                style={{
                  width: panelTypes.length * totalIconWidth,
                  left: '0',
                }}
              >
                {panelTypes.map((panelType, index) => {
                  const config = panelConfig[panelType];
                  const Icon = config.icon;
                  const isSelected = index === selectedIndex;
                  const isVisible = Math.abs(index - selectedIndex) <= 2; // 더 많은 아이콘 표시

                  return (
                    <motion.div
                      key={panelType}
                      className="flex items-center justify-center cursor-pointer panel-selector-icon-item"
                      style={{
                        width: iconSize,
                        height: iconSize,
                        marginRight: index < panelTypes.length - 1 ? iconSpacing : 0,
                      }}
                      onClick={() => handleIconClick(index)}
                      onMouseEnter={(e) => handleIconMouseEnter(e, panelType)}
                      onMouseLeave={handleIconMouseLeave}
                      animate={{
                        scale: isSelected ? 1.3 : 1,
                        opacity: isVisible ? 1 : 0.3
                      }}
                      transition={animationConfig}
                      whileHover={{
                        scale: isSelected ? 1.35 : 1.1,
                        transition: { duration: 0.1 }
                      }}
                      whileTap={{
                        scale: isSelected ? 1.25 : 0.9,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <motion.div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center panel-selector-icon-wrapper ${isSelected ? 'selected' : ''}`}
                        animate={{
                          backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                          boxShadow: isSelected ? 'var(--shadow-inset-subtle)' : 'var(--shadow-outset-subtle)'
                        }}
                        transition={animationConfig}
                      >
                        <Icon 
                          className={`w-3 h-3 transition-colors duration-200 panel-selector-icon ${
                            isSelected ? 'text-white' : 'text-text-secondary'
                          }`} 
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* 좌우 그라데이션 마스크 */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none panel-selector-gradient-left"
                style={{
                  background: 'linear-gradient(90deg, var(--surface-color) 0%, transparent 100%)'
                }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none panel-selector-gradient-right"
                style={{
                  background: 'linear-gradient(270deg, var(--surface-color) 0%, transparent 100%)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 개별 아이콘 툴팁 */}
      {hoveredPanelType && tooltipPosition && (
        <Portal>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="panel-selector-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y - 24,
              transform: 'translateX(-50%)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            {panelConfig[hoveredPanelType]?.title || 'Unknown'}
          </motion.div>
        </Portal>
      )}

      {/* 선택기가 열렸을 때 상태 표시 - 하단 툴팁 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={animationConfig}
            className="absolute top-full mt-1 px-2 py-1 rounded-lg text-xs font-medium panel-selector-tooltip"
            style={{
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              width: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center' as const,
            }}
          >
            {panelConfig[panelTypes[selectedIndex]]?.title || 'Unknown'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};