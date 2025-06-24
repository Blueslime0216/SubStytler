import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';
import { PanelType } from '../../types/project';

interface PanelActionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onSplitPanel: (direction: 'horizontal' | 'vertical', newPanelType: PanelType) => void;
}

export const PanelActionsDropdown: React.FC<PanelActionsDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  onSplitPanel
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 140; // 높이 조정
      
      let top = rect.bottom + 8;
      let left = rect.right - 180; // 너비 조정
      
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 8;
      }
      
      if (left < 16) {
        left = 16;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
            width: '180px',
            background: 'var(--neu-base)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: `
              12px 12px 24px rgba(13, 17, 23, 0.8),
              -6px -6px 14px rgba(45, 55, 72, 0.6)
            `,
            border: '2px solid rgba(45, 55, 72, 0.3)',
          }}
        >
          <div className="space-y-2">
            <div className="neu-caption px-2 py-1 mb-3 text-center">
              <span className="font-semibold">패널 분할</span>
            </div>
            
            {/* 🔀 가로 분할 버튼 */}
            <motion.button
              onClick={() => {
                console.log('🔀 가로 분할 실행');
                onSplitPanel('horizontal', 'empty'); // 🆕 빈 패널로 분할
              }}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left cursor-pointer neu-interactive"
              style={{
                background: 'var(--neu-base)',
                boxShadow: `
                  4px 4px 8px rgba(13, 17, 23, 0.6),
                  -2px -2px 6px rgba(45, 55, 72, 0.4)
                `,
                border: '1px solid rgba(45, 55, 72, 0.3)',
                transition: 'all 0.2s ease',
              }}
              whileHover={{
                boxShadow: `
                  6px 6px 12px rgba(13, 17, 23, 0.7),
                  -3px -3px 8px rgba(45, 55, 72, 0.5)
                `,
              }}
              whileTap={{
                boxShadow: `
                  inset 2px 2px 4px rgba(13, 17, 23, 0.6),
                  inset -1px -1px 3px rgba(45, 55, 72, 0.4)
                `,
              }}
              title="패널을 가로로 분할"
            >
              <motion.div
                className="w-6 h-6 rounded-lg neu-shadow-subtle flex items-center justify-center"
                style={{ background: 'var(--neu-primary)' }}
              >
                <svg className="w-3 h-3 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </motion.div>
              <span className="text-xs font-medium neu-text-primary">가로 분할</span>
            </motion.button>
            
            {/* 🔀 세로 분할 버튼 */}
            <motion.button
              onClick={() => {
                console.log('🔀 세로 분할 실행');
                onSplitPanel('vertical', 'empty'); // 🆕 빈 패널로 분할
              }}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left cursor-pointer neu-interactive"
              style={{
                background: 'var(--neu-base)',
                boxShadow: `
                  4px 4px 8px rgba(13, 17, 23, 0.6),
                  -2px -2px 6px rgba(45, 55, 72, 0.4)
                `,
                border: '1px solid rgba(45, 55, 72, 0.3)',
                transition: 'all 0.2s ease',
              }}
              whileHover={{
                boxShadow: `
                  6px 6px 12px rgba(13, 17, 23, 0.7),
                  -3px -3px 8px rgba(45, 55, 72, 0.5)
                `,
              }}
              whileTap={{
                boxShadow: `
                  inset 2px 2px 4px rgba(13, 17, 23, 0.6),
                  inset -1px -1px 3px rgba(45, 55, 72, 0.4)
                `,
              }}
              title="패널을 세로로 분할"
            >
              <motion.div
                className="w-6 h-6 rounded-lg neu-shadow-subtle flex items-center justify-center"
                style={{ background: 'var(--neu-success)' }}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </motion.div>
              <span className="text-xs font-medium neu-text-primary">세로 분할</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};