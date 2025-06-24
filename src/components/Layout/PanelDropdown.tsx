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

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 320;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 8;
      }
      
      const dropdownWidth = 280;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  const handlePanelSelect = (panelType: PanelType) => {
    console.log('🎯 드롭다운에서 패널 선택:', panelType);
    onPanelChange(panelType);
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="neu-dropdown fixed z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
            width: '280px'
          }}
        >
          <div className="p-3">
            <div className="neu-caption font-medium px-2 py-2 mb-2">
              🔄 패널 타입 변경
            </div>
            
            <div className="space-y-1">
              {availablePanels.map(([panelType, panelConfig]) => {
                const PanelIcon = panelConfig.icon;
                return (
                  <motion.button
                    key={panelType}
                    onClick={() => handlePanelSelect(panelType as PanelType)}
                    className="neu-dropdown-item w-full flex items-center space-x-3 p-3 text-left cursor-pointer neu-interactive"
                    title={`${panelConfig.title}로 변경`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="p-1.5 rounded-lg neu-shadow-1 cursor-pointer"
                      style={{ background: 'linear-gradient(145deg, var(--neu-base), var(--neu-accent))' }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <PanelIcon className="w-3.5 h-3.5 neu-text-accent" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="neu-body-primary text-xs font-medium">
                        {panelConfig.title}
                      </div>
                      <div className="neu-caption text-xs truncate">
                        {panelConfig.description}
                      </div>
                    </div>
                    <motion.svg 
                      className="w-3 h-3 neu-text-secondary opacity-0 group-hover:opacity-100"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ x: 2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};