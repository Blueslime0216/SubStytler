import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoControllerContainerProps {
  isVisible: boolean;
  isPinned: boolean;
  isInteracting: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

const VideoControllerContainer: React.FC<VideoControllerContainerProps> = ({
  isVisible,
  isPinned,
  isInteracting,
  onMouseEnter,
  onMouseLeave,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          ref={containerRef}
          className="video-controller-container"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoControllerContainer;