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
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-white border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white text-lg font-medium">Loading video...</p>
        <p className="text-gray-300 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};