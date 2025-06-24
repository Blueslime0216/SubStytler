import React from 'react';
import { motion } from 'framer-motion';

interface VideoLoadingOverlayProps {
  isLoading: boolean;
}

export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({
  isLoading
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center neu-bg-base/70 backdrop-blur-sm z-20">
      <motion.div 
        className="neu-card text-center p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-12 h-12 mx-auto mb-4 neu-shadow-inset rounded-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div 
            className="w-8 h-8 rounded-full"
            style={{ 
              background: `conic-gradient(var(--neu-primary) 90deg, var(--neu-accent) 0deg)`
            }}
          />
        </motion.div>
        <h3 className="neu-heading-secondary mb-2">Loading video...</h3>
        <p className="neu-caption">Please wait while we prepare your video</p>
      </motion.div>
    </div>
  );
};