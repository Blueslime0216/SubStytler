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
      const dropdownHeight = 400;
      
      let top = rect.bottom + 12;
      let left = rect.left;
      
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 12;
      }
      
      const dropdownWidth = 320;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 24;
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
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="dropdown-portal fixed z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
            width: '320px'
          }}
        >
          <div className="p-4">
            <div className="caption font-medium px-2 py-2 mb-3">
              Switch Panel Type
            </div>
            
            <div className="space-y-2">
              {availablePanels.map(([panelType, panelConfig]) => {
                const PanelIcon = panelConfig.icon;
                return (
                  <motion.button
                    key={panelType}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPanelChange(panelType as PanelType)}
                    className="dropdown-item w-full flex items-center space-x-4 p-4 text-left"
                  >
                    <motion.div 
                      className="p-2.5 rounded-xl bg-surface border border-accent/20"
                      whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                    >
                      <PanelIcon className="w-5 h-5 text-accent" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="body-primary font-medium">
                        {panelConfig.title}
                      </div>
                      <div className="caption truncate">
                        {panelConfig.description}
                      </div>
                    </div>
                    <motion.svg 
                      className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ x: 4 }}
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