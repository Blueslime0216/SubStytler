import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../UI/Portal';

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
      const confirmationHeight = 100; // Estimated confirmation height
      
      // Calculate optimal position
      let top = rect.bottom + 4; // 4px gap below trigger
      let left = rect.right - 192; // Align right edge (w-48 = 192px)
      
      // Check if confirmation would go below viewport
      if (top + confirmationHeight > viewportHeight) {
        top = rect.top - confirmationHeight - 4; // Position above trigger
      }
      
      // Ensure confirmation doesn't go off-screen horizontally
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
      
      {/* Confirmation */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="fixed w-48 bg-red-900/90 border border-red-600 rounded-lg shadow-xl z-50 p-3"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <p className="text-sm text-red-100 mb-2">Remove this panel?</p>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
            >
              Remove
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};