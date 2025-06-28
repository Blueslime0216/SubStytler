import React from 'react';
import { motion } from 'framer-motion';
import { Video, Loader2 } from 'lucide-react';

interface VideoLoadingOverlayProps {
  isLoading: boolean;
}

export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({
  isLoading
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <motion.div 
        className="bg-surface border-2 border-border-color rounded-lg shadow-outset-strong p-8 text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-surface/10 opacity-50" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Animated Loading Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-6 bg-surface rounded-2xl shadow-outset flex items-center justify-center relative overflow-hidden"
            animate={{
              boxShadow: [
                'var(--shadow-outset)',
                'var(--shadow-outset-strong)',
                'var(--shadow-outset)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Icon Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60" />
            
            {/* Rotating Loader */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Loading Video
          </h3>
          <p className="text-text-secondary text-sm">
            Preparing your video for editing...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full" />
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/20 rounded-full" />
      </motion.div>
    </div>
  );
};