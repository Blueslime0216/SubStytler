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
      const dropdownHeight = 500;
      
      let top = rect.bottom + 16;
      let left = rect.left;
      
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 16;
      }
      
      const dropdownWidth = 380;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 32;
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
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="dropdown-station fixed z-50 overflow-hidden"
          style={{
            top: position.top,
            left: position.left,
            width: '380px'
          }}
        >
          <div className="p-6">
            <div className="caption-station font-semibold px-3 py-3 mb-4 text-nebula">
              Switch Panel Type
            </div>
            
            <div className="space-y-3">
              {availablePanels.map(([panelType, panelConfig]) => {
                const PanelIcon = panelConfig.icon;
                return (
                  <motion.button
                    key={panelType}
                    whileHover={{ scale: 1.02, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPanelChange(panelType as PanelType)}
                    className="dropdown-item-station w-full flex items-center space-x-5 p-5 text-left"
                  >
                    <motion.div 
                      className="p-3 rounded-xl bg-energy border-2 border-nebula shadow-energy"
                      whileHover={{ rotate: 5 }}
                    >
                      <PanelIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="body-station-primary font-semibold text-nebula">
                        {panelConfig.title}
                      </div>
                      <div className="caption-station truncate">
                        {panelConfig.description}
                      </div>
                    </div>
                    <motion.svg 
                      className="w-5 h-5 text-stellar-secondary opacity-0 group-hover:opacity-100"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ x: 6 }}
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