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
    // 확정 처리: 이미 중앙에 있는(선택된) 아이콘을 클릭
    if (index === selectedIndex) {
      const selectedType = panelTypes[index];
      if (selectedType !== currentType) {
        onTypeChange(selectedType);
      }
      setIsOpen(false);
      return;
    }

    // 이동 처리: 다른 아이콘 클릭 -> 해당 아이콘을 중앙으로 이동
    if (isAnimating) return; // 이동 중 반복 입력 방지

    setIsAnimating(true);
    setSelectedIndex(index);

    // ⏱️ 애니메이션이 끝난 뒤 자동 확정 (한 번의 클릭으로 이동 + 확정)
    setTimeout(() => {
      setIsAnimating(false);
      const movedType = panelTypes[index];
      if (movedType !== currentType) {
        onTypeChange(movedType);
      }
      setIsOpen(false);
    }, 200); // 아이콘 애니메이션과 동일한 0.2초 후 실행
  }, [selectedIndex, currentType, onTypeChange, panelTypes, isAnimating]);

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

  // 아이콘 및 간격 설정 - 정확한 값으로 재조정
  const iconSize = 40; // 각 아이콘의 너비
  const iconSpacing = 12; // 아이콘 간 간격
  const totalIconWidth = iconSize + iconSpacing; // 아이콘 + 오른쪽 간격
  const iconBlockWidth = iconSize; // 순수 아이콘 블록 너비 (중앙 정렬용)
  
  // 버튼이 열렸을 때의 전체 너비
  const openWidth = 200; // motion.button animate 시 고정된 폭
  
  // 디버깅용 로그
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 선택기 오프셋 정보:', {
        openWidth,
        iconSize,
        iconSpacing,
        totalIconWidth,
        centerOffset: openWidth / 2 - iconBlockWidth / 2,
        selectedIndex
      });
    }
  }, [isOpen, selectedIndex, openWidth, iconSize, iconSpacing, totalIconWidth, iconBlockWidth]);
  
  // 중앙 정렬 오프셋 계산 - 정확히 중앙에 아이콘이 오도록 조정
  // 정확한 위치에 아이콘을 배치하기 위해 수동으로 미세 조정된 값 사용
  const centerOffset = 80; // 수동 조정된 최적 오프셋

  // 디버그 모드 - 개발 중에만 활성화
  const DEBUG_VISUAL = false; // 시각적 디버깅 활성화 여부

  return (
    <div ref={selectorRef} className={`relative ${className}`}>
      {/* 메인 선택기 버튼 */}
      <motion.button
        onClick={toggleSelector}
        className="relative cursor-pointer neu-interactive flex items-center justify-center"
        title={`${currentConfig.title} - 클릭하여 패널 변경`}
        initial={false}
        animate={{
          width: isOpen ? 200 : 48, // 더 넓게 확장
          height: 48,
          borderRadius: isOpen ? 24 : 12,
        }}
        transition={animationConfig}
        style={{
          background: isOpen 
            ? 'var(--neu-accent)'
            : 'var(--neu-base)',
          boxShadow: isOpen 
            ? `inset 4px 4px 12px rgba(13, 17, 23, 0.6), inset -2px -2px 8px rgba(45, 55, 72, 0.4)`
            : `4px 4px 12px rgba(13, 17, 23, 0.6), -2px -2px 8px rgba(45, 55, 72, 0.4)`,
          border: '2px solid rgba(45, 55, 72, 0.3)',
          transition: 'all 0.2s ease',
          overflow: 'hidden', // 🔧 중요: 아이콘들이 밖으로 튀어나오지 않도록
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
              className="flex items-center justify-center w-full h-full"
            >
              <CurrentIcon className="w-5 h-5 text-white transition-colors duration-200" />
            </motion.div>
          ) : (
            // 열린 상태: 아이콘 캐러셀
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animationConfig}
              className="relative w-full h-full flex items-center justify-center"
              style={{ overflow: 'hidden' }} // 🔧 추가 보안
              onWheel={handleWheel}
            >
              {/* 아이콘 캐러셀 컨테이너 */}
              <motion.div
                className="flex items-center absolute"
                animate={{
                  x: -selectedIndex * totalIconWidth + centerOffset
                }}
                transition={animationConfig}
                style={{
                  width: panelTypes.length * totalIconWidth,
                  // DEBUG: 시각적 디버깅 요소
                  ...(DEBUG_VISUAL ? {
                    border: '1px dashed red',
                    background: 'rgba(255,0,0,0.05)'
                  } : {}),
                  // 🔧 중요: 아이콘 컨테이너의 시작 위치를 정확히 지정
                  left: '0',
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
                        marginRight: index < panelTypes.length - 1 ? iconSpacing : 0,
                        // DEBUG: 시각적 디버깅 요소
                        ...(DEBUG_VISUAL ? {
                          border: `1px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? 'yellow' : 'blue'}`,
                          background: isSelected ? 'rgba(255,255,0,0.1)' : 'rgba(0,0,255,0.05)'
                        } : {})
                      }}
                      onClick={() => handleIconClick(index)}
                      animate={{
                        scale: isSelected ? 1.3 : 1, // 🔧 더 큰 스케일
                        // y 오프셋 제거 - 위로 올라가는 효과 없애기
                        opacity: isVisible ? 1 : 0.3
                      }}
                      transition={animationConfig}
                      whileHover={{
                        scale: isSelected ? 1.35 : 1.05,
                        // y 오프셋 없이 크기만 변경
                        transition: { duration: 0.1 }
                      }}
                      whileTap={{
                        scale: isSelected ? 1.25 : 0.95,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <motion.div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark))' // 🔧 그라데이션 배경
                            : 'var(--neu-base)',
                          boxShadow: isSelected
                            ? `
                                4px 4px 12px rgba(13, 17, 23, 0.8),
                                -2px -2px 8px rgba(45, 55, 72, 0.6),
                                0 0 16px rgba(99, 179, 237, 0.6),
                                inset 1px 1px 3px rgba(255, 255, 255, 0.2)
                              ` // 🔧 더 강한 글로우 효과
                            : `2px 2px 6px rgba(13, 17, 23, 0.4), -1px -1px 4px rgba(45, 55, 72, 0.3)`,
                          border: isSelected 
                            ? '2px solid rgba(99, 179, 237, 0.8)' // 🔧 파란색 테두리
                            : '1px solid rgba(45, 55, 72, 0.3)',
                        }}
                        animate={{
                          boxShadow: isSelected
                            ? `
                                4px 4px 12px rgba(13, 17, 23, 0.8),
                                -2px -2px 8px rgba(45, 55, 72, 0.6),
                                0 0 16px rgba(99, 179, 237, 0.6),
                                inset 1px 1px 3px rgba(255, 255, 255, 0.2)
                              `
                            : `2px 2px 6px rgba(13, 17, 23, 0.4), -1px -1px 4px rgba(45, 55, 72, 0.3)`
                        }}
                        transition={animationConfig}
                      >
                        <Icon 
                          className={`w-4 h-4 transition-colors duration-200 ${
                            isSelected ? 'text-white drop-shadow-sm' : 'text-gray-400'
                          }`} 
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* 좌우 그라데이션 마스크 - 더 부드러운 페이드 효과 */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, var(--neu-accent) 0%, transparent 100%)'
                }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(270deg, var(--neu-accent) 0%, transparent 100%)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 선택기가 열렸을 때 상태 표시 - 커스텀 툴팁 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={animationConfig}
            className="absolute top-full mt-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--neu-base)',
              boxShadow: `4px 4px 12px rgba(13, 17, 23, 0.6), -2px -2px 8px rgba(45, 55, 72, 0.4)`,
              border: '2px solid rgba(45, 55, 72, 0.3)',
              color: 'var(--neu-text-primary)',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              // 고정 너비와 중앙 정렬로 위치 문제 해결
              width: '140px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center' as const,
            }}
          >
            {panelConfig[panelTypes[selectedIndex]]?.title || 'Unknown'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEBUG: 중앙 마커 */}
      {isOpen && DEBUG_VISUAL && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
          style={{ 
            left: 'calc(50% - 0.5px)',
            opacity: 0.5
          }}
        />
      )}
    </div>
  );
};