import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';
import { PanelType } from '../../types/project';
import { Cog } from 'lucide-react';

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
      
      const dropdownWidth = 280;
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
          className="dropdown-steampunk fixed z-50 overflow-hidden relative"
          style={{
            top: position.top,
            left: position.left,
            width: '280px'
          }}
        >
          {/* 장식용 기어들 */}
          <div className="absolute top-2 right-2">
            <Cog className="w-3 h-3 text-brass gear opacity-30" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Cog className="w-2 h-2 text-copper gear-reverse opacity-25" />
          </div>
          
          {/* 리벳 장식 */}
          <div className="rivet-decoration top-1 left-1"></div>
          <div className="rivet-decoration top-1 right-1"></div>
          <div className="rivet-decoration bottom-1 left-1"></div>
          <div className="rivet-decoration bottom-1 right-1"></div>
          
          <div className="p-3 relative z-10">
            <div className="font-steampunk text-xs font-medium text-brass px-2 py-2 mb-2">
              Switch Panel Configuration
            </div>
            
            <div className="space-y-1">
              {availablePanels.map(([panelType, panelConfig]) => {
                const PanelIcon = panelConfig.icon;
                return (
                  <motion.button
                    key={panelType}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPanelChange(panelType as PanelType)}
                    className="dropdown-item-steampunk w-full flex items-center space-x-3 text-left relative overflow-hidden"
                  >
                    <motion.div 
                      className="p-1.5 rounded-lg bg-copper border border-copper-dark relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <PanelIcon className="w-3 h-3 text-workshop" />
                      <div className="absolute inset-0 texture-metal opacity-30"></div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-steampunk text-sm font-medium text-primary">
                        {panelConfig.title}
                      </div>
                      <div className="font-mono text-xs text-muted truncate">
                        {panelConfig.description}
                      </div>
                    </div>
                    <motion.svg 
                      className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100"
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