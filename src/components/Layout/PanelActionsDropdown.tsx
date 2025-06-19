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
      const dropdownHeight = 120; // Estimated dropdown height
      
      // Calculate optimal position
      let top = rect.bottom + 4; // 4px gap below trigger
      let left = rect.right - 192; // Align right edge (w-48 = 192px)
      
      // Check if dropdown would go below viewport
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4; // Position above trigger
      }
      
      // Ensure dropdown doesn't go off-screen horizontally
      if (left < 16) {
        left = 16; // 16px margin from left edge
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="p-2">
            <div className="text-xs text-gray-400 px-2 py-1 mb-1">
              Panel Actions
            </div>
            
            {/* Split Horizontally */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
              onClick={() => onSplitPanel('horizontal', 'text-editor')}
              className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm text-gray-200">Split Horizontally</span>
            </motion.button>
            
            {/* Split Vertically */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
              onClick={() => onSplitPanel('vertical', 'text-editor')}
              className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm text-gray-200">Split Vertically</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};