import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';
import { PanelType } from '../../types/project';

interface PanelDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  availablePanels: [string, any][];
  onPanelChange: (panelType: PanelType) => void;
}

export const PanelDropdown: React.FC<PanelDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  availablePanels,
  onPanelChange
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // 🎯 드롭다운 크기 계산
      const dropdownWidth = 320;
      const dropdownHeight = Math.min(400, availablePanels.length * 80 + 80);
      
      // 📍 위치 계산 - 트리거 버튼 근처에 자연스럽게 배치
      let top = rect.bottom + 12;
      let left = rect.left - 8;
      
      // 🔄 화면 경계 체크 및 조정
      if (top + dropdownHeight > viewportHeight - 20) {
        top = rect.top - dropdownHeight - 12;
      }
      
      if (left + dropdownWidth > viewportWidth - 20) {
        left = viewportWidth - dropdownWidth - 20;
      }
      
      if (left < 20) {
        left = 20;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef, availablePanels.length]);

  const handlePanelSelect = (panelType: PanelType) => {
    console.log('🎯 뉴모피즘 패널 선택:', panelType);
    onPanelChange(panelType);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* 🌫️ 백드롭 오버레이 */}
      <motion.div 
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          background: 'rgba(26, 32, 44, 0.4)',
          backdropFilter: 'blur(8px)',
        }}
      />
      
      <AnimatePresence>
        {/* 🎨 메인 뉴모피즘 컨테이너 */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.85, 
            y: -20,
            rotateX: -15
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotateX: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.85, 
            y: -20,
            rotateX: -15
          }}
          transition={{ 
            duration: 0.3, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="fixed z-50"
          style={{
            top: position.top,
            left: position.left,
            width: '320px',
            maxHeight: '400px',
            background: 'var(--neu-base)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: `
              20px 20px 60px rgba(13, 17, 23, 0.8),
              -10px -10px 30px rgba(45, 55, 72, 0.6),
              inset 2px 2px 8px rgba(45, 55, 72, 0.3),
              inset -2px -2px 8px rgba(13, 17, 23, 0.4)
            `,
            border: '2px solid rgba(45, 55, 72, 0.4)',
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ✨ 내부 글로우 효과 */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(99, 179, 237, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(45, 55, 72, 0.2) 0%, transparent 50%)
              `,
              borderRadius: '24px',
            }}
          />

          {/* 📋 헤더 */}
          <motion.div 
            className="relative z-10 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="neu-heading-secondary text-base font-bold neu-text-primary">
                  패널 선택
                </h3>
                <p className="neu-caption text-xs neu-text-secondary mt-1">
                  원하는 패널 타입을 선택하세요
                </p>
              </div>
              
              {/* 🔄 애니메이션 인디케이터 */}
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark))',
                  boxShadow: `
                    4px 4px 12px rgba(13, 17, 23, 0.6),
                    -2px -2px 8px rgba(45, 55, 72, 0.4)
                  `,
                }}
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* 🎯 패널 옵션 그리드 */}
          <div className="relative z-10 space-y-3 max-h-80 overflow-y-auto pr-2">
            {availablePanels.map(([panelType, panelConfig], index) => {
              const PanelIcon = panelConfig.icon;
              const isSelected = selectedIndex === index;
              
              return (
                <motion.button
                  key={panelType}
                  onClick={() => handlePanelSelect(panelType as PanelType)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                  className="w-full text-left cursor-pointer group relative overflow-hidden"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(145deg, var(--neu-accent), var(--neu-surface))'
                      : 'var(--neu-base)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: isSelected
                      ? `
                          inset 4px 4px 12px rgba(13, 17, 23, 0.6),
                          inset -2px -2px 8px rgba(45, 55, 72, 0.4),
                          0 0 20px rgba(99, 179, 237, 0.3)
                        `
                      : `
                          6px 6px 18px rgba(13, 17, 23, 0.6),
                          -3px -3px 12px rgba(45, 55, 72, 0.4)
                        `,
                    border: isSelected 
                      ? '2px solid rgba(99, 179, 237, 0.5)'
                      : '2px solid rgba(45, 55, 72, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                >
                  {/* 🌟 호버 글로우 효과 */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: `
                        radial-gradient(circle at 50% 50%, rgba(99, 179, 237, 0.15) 0%, transparent 70%)
                      `,
                      borderRadius: '16px',
                    }}
                  />

                  <div className="flex items-center space-x-4 relative z-10">
                    {/* 🎨 아이콘 컨테이너 */}
                    <motion.div 
                      className="flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: isSelected
                          ? 'linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark))'
                          : 'linear-gradient(145deg, var(--neu-light), var(--neu-accent))',
                        boxShadow: isSelected
                          ? `
                              4px 4px 12px rgba(13, 17, 23, 0.8),
                              -2px -2px 8px rgba(45, 55, 72, 0.6),
                              0 0 16px rgba(99, 179, 237, 0.4)
                            `
                          : `
                              4px 4px 12px rgba(13, 17, 23, 0.6),
                              -2px -2px 8px rgba(45, 55, 72, 0.4)
                            `,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <PanelIcon 
                        className={`w-5 h-5 ${
                          isSelected ? 'text-white' : 'neu-text-accent'
                        } transition-colors duration-300`} 
                      />
                    </motion.div>
                    
                    {/* 📝 텍스트 정보 */}
                    <div className="flex-1 min-w-0">
                      <motion.h4 
                        className={`font-semibold text-sm ${
                          isSelected ? 'neu-text-primary' : 'neu-text-primary'
                        } transition-colors duration-300`}
                        animate={{ 
                          x: isSelected ? 4 : 0,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {panelConfig.title}
                      </motion.h4>
                      <motion.p 
                        className={`text-xs mt-1 ${
                          isSelected ? 'neu-text-secondary' : 'neu-text-muted'
                        } transition-colors duration-300`}
                        animate={{ 
                          x: isSelected ? 4 : 0,
                          transition: { duration: 0.2, delay: 0.05 }
                        }}
                      >
                        {panelConfig.description}
                      </motion.p>
                    </div>
                    
                    {/* ➡️ 선택 화살표 */}
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: isSelected ? 1 : 0,
                        x: isSelected ? 0 : -10,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <svg 
                        className="w-4 h-4 neu-text-primary" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 📊 하단 상태 표시 */}
          <motion.div 
            className="relative z-10 mt-6 pt-4"
            style={{
              borderTop: '1px solid rgba(45, 55, 72, 0.3)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span className="neu-caption text-xs neu-text-muted">
                {availablePanels.length}개 패널 사용 가능
              </span>
              
              <motion.div
                className="flex items-center space-x-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span className="neu-caption text-xs neu-text-accent">
                  준비됨
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};