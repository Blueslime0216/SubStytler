import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';
import { PanelType } from '../../types/project';
import { Cog, Split } from 'lucide-react';

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
      const dropdownHeight = 120;
      
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
          className="dropdown-steampunk fixed z-50 overflow-hidden relative"
          style={{
            top: position.top,
            left: position.left,
            width: '160px'
          }}
        >
          {/* 장식 요소들 */}
          <div className="absolute top-1 right-1">
            <Cog className="w-2 h-2 text-brass gear-slow opacity-30" />
          </div>
          <div className="rivet-decoration top-1 left-1"></div>
          <div className="rivet-decoration bottom-1 right-1"></div>
          
          <div className="p-2 relative z-10">
            <div className="font-steampunk text-xs text-brass px-2 py-1 mb-1">
              Panel Operations
            </div>
            
            {/* 수평 분할 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => onSplitPanel('horizontal', 'text-editor')}
              className="dropdown-item-steampunk w-full flex items-center space-x-2 text-left"
            >
              <Split className="w-3 h-3 text-copper rotate-90" />
              <span className="font-body text-xs text-primary">Split Horizontal</span>
            </motion.button>
            
            {/* 수직 분할 */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => onSplitPanel('vertical', 'text-editor')}
              className="dropdown-item-steampunk w-full flex items-center space-x-2 text-left"
            >
              <Split className="w-3 h-3 text-copper" />
              <span className="font-body text-xs text-primary">Split Vertical</span>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};