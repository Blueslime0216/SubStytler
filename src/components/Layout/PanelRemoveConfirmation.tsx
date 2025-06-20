import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';
import { Cog, AlertTriangle } from 'lucide-react';

interface PanelRemoveConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export const PanelRemoveConfirmation: React.FC<PanelRemoveConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  triggerRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const confirmationHeight = 100;
      
      let top = rect.bottom + 4;
      let left = rect.right - 160;
      
      if (top + confirmationHeight > viewportHeight) {
        top = rect.top - confirmationHeight - 4;
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
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="fixed z-50 bg-red-900 border-2 border-red-600 rounded-lg shadow-copper overflow-hidden relative"
          style={{
            top: position.top,
            left: position.left,
            width: '160px'
          }}
        >
          {/* 경고 장식 */}
          <div className="absolute top-1 right-1">
            <Cog className="w-2 h-2 text-red-400 gear opacity-50" />
          </div>
          <div className="rivet-decoration top-1 left-1 bg-red-500"></div>
          <div className="rivet-decoration bottom-1 right-1 bg-red-500"></div>
          
          <div className="p-3 relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-3 h-3 text-red-300" />
              <p className="font-steampunk text-xs text-red-100">Remove Panel?</p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white font-steampunk border border-red-500"
              >
                Remove
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-2 py-1 bg-copper hover:bg-brass rounded text-xs text-white font-steampunk border border-copper-dark"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};