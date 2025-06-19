import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface VideoErrorOverlayProps {
  error: string | null;
  onRetry: () => void;
}

export const VideoErrorOverlay: React.FC<VideoErrorOverlayProps> = ({
  error,
  onRetry
}) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-white" />
        </div>
        <p className="text-white text-lg font-medium mb-2">Video Error</p>
        <p className="text-gray-300 text-sm mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          Retry
        </motion.button>
      </div>
    </div>
  );
};