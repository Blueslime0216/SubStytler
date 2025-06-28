import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <motion.div 
        className="bg-darker-color border border-darker-color rounded-lg shadow-inset max-w-md w-full p-8 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-error-color/5 via-transparent to-surface/10 opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Error Icon */}
          <motion.div 
            className="w-16 h-16 mx-auto mb-6 bg-darker-color rounded-2xl shadow-inset flex items-center justify-center relative overflow-hidden"
            animate={{ 
              boxShadow: [
                'var(--shadow-inset)',
                'var(--shadow-inset-strong)',
                'var(--shadow-inset)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Icon Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-error-color/20 to-transparent opacity-60" />
            
            {/* Animated Warning Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AlertTriangle className="w-8 h-8 text-error-color/80" />
            </motion.div>
          </motion.div>
          
          {/* Error Message */}
          <h3 className="text-lg font-semibold text-error-color/90 mb-3">
            Video Error
          </h3>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            {error}
          </p>
          
          {/* Action Button */}
          <motion.button
            onClick={onRetry}
            className="px-6 py-3 bg-error-color/40 text-white font-semibold rounded-lg shadow-inset border border-error-color/30 transition-all duration-200 flex items-center gap-2 mx-auto"
            whileHover={{ 
              filter: 'brightness(1.1)',
              boxShadow: 'var(--shadow-outset-hover)'
            }}
            whileTap={{ 
              boxShadow: 'var(--shadow-pressed)',
              transform: 'translateY(1px)'
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </motion.button>

          {/* Additional Help */}
          <div className="mt-6 p-4 bg-darker-color rounded-lg shadow-inset-subtle">
            <p className="text-xs text-text-muted">
              <strong>Common solutions:</strong><br />
              • Check if the video file is corrupted<br />
              • Try a different video format (MP4 recommended)<br />
              • Ensure the file size is under 5GB
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-error-color/30 rounded-full" />
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-error-color/20 rounded-full" />
      </motion.div>
    </div>
  );
};