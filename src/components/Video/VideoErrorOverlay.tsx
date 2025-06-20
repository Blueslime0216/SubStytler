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
    <div className="absolute inset-0 flex items-center justify-center neu-bg-base/70 backdrop-blur-sm">
      <motion.div 
        className="neu-card text-center p-6 max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, var(--neu-error), #dc2626)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="neu-heading-secondary mb-2" style={{ color: 'var(--neu-error)' }}>
          Video Error
        </h3>
        <p className="neu-body-secondary text-sm mb-4">{error}</p>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="neu-btn-primary flex items-center space-x-2 mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry</span>
        </motion.button>
      </motion.div>
    </div>
  );
};