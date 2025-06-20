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
      const confirmationHeight = 80;
      
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
          className="neu-dropdown fixed w-40 z-50 p-3"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <p className="text-xs neu-text-primary mb-2">Remove this panel?</p>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="neu-btn-small px-2 py-1 text-xs"
              style={{ color: 'var(--neu-error)' }}
            >
              Remove
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="neu-btn-small px-2 py-1 text-xs"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};