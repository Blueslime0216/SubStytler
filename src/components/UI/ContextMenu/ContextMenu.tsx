import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '../Portal';

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  children
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to ensure menu stays within viewport
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust X if menu would go off right edge
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 8;
    }

    // Adjust Y if menu would go off bottom edge
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 8;
    }

    return { x: adjustedX, y: adjustedY };
  };

  if (!isOpen) return null;

  const { x: adjustedX, y: adjustedY } = adjustPosition();

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible overlay to capture clicks outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={onClose}
            />

            <motion.div
              ref={menuRef}
              className="context-menu"
              style={{
                left: adjustedX,
                top: adjustedY
              }}
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
};