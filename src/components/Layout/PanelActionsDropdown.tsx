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
      const dropdownHeight = 100;
      
      let top = rect.bottom + 4;
      let left = rect.right - 160;
      
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4;
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
          className="neu-dropdown fixed w-40 z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="p-2">
            <div className="neu-caption px-2 py-1 mb-1">
              Panel Actions
            </div>
            
            <motion.button
              onClick={() => onSplitPanel('horizontal', 'text-editor')}
              className="neu-dropdown-item w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left cursor-pointer neu-interactive"
              title="Split panel horizontally"
            >
              <svg className="w-3 h-3 neu-text-secondary rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs">Split Horizontally</span>
            </motion.button>
            
            <motion.button
              onClick={() => onSplitPanel('vertical', 'text-editor')}
              className="neu-dropdown-item w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left cursor-pointer neu-interactive"
              title="Split panel vertically"
            >
              <svg className="w-3 h-3 neu-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs">Split Vertically</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};