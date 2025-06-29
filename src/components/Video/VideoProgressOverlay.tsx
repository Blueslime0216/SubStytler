import React from 'react';
import { motion } from 'framer-motion';
import { Video, CheckCircle, Loader } from 'lucide-react';
import { Portal } from '../UI/Portal';

interface VideoProgressOverlayProps {
  progress: number;
}

export const VideoProgressOverlay: React.FC<VideoProgressOverlayProps> = ({
  progress
}) => {
  const stage = progress < 20 ? 'Validating'
    : progress < 40 ? 'Loading' 
    : progress < 60 ? 'Processing'
    : progress < 80 ? 'Setting up'
    : 'Completing';

  const isComplete = progress >= 100;

  return (
    <Portal>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div 
          className="bg-bg border border-border-color rounded-lg shadow-elevated max-w-md w-full p-8 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-info-color/5 via-transparent to-surface/10 opacity-50" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              {/* Animated Icon */}
              <motion.div 
                className="w-12 h-12 bg-surface rounded-xl shadow-outset flex items-center justify-center relative overflow-hidden"
                animate={{
                  boxShadow: isComplete 
                    ? 'var(--shadow-inset)' 
                    : 'var(--shadow-outset)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60" />
                
                <motion.div
                  animate={{ 
                    rotate: isComplete ? 0 : 360,
                    scale: isComplete ? 1.1 : 1
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: isComplete ? 0 : Infinity, ease: 'linear' },
                    scale: { duration: 0.3 }
                  }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-success-color" />
                  ) : (
                    <Loader className="w-6 h-6 text-info-color" />
                  )}
                </motion.div>
              </motion.div>
              
              {/* Text */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-text-primary">
                    {isComplete ? 'Upload Complete!' : 'Processing Video'}
                  </span>
                  <span className="text-info-color font-mono text-sm font-bold">
                    {progress}%
                  </span>
                </div>
                <p className="text-text-secondary text-sm">
                  {isComplete ? 'Video ready for editing' : stage}
                </p>
              </div>
            </div>
            
            {/* Progress Bar Container - Improved */}
            <div className="bg-surface rounded-lg p-4 shadow-outset-subtle mb-6">
              <div className="relative h-6 bg-bg rounded-full shadow-inset overflow-hidden">
                {/* Progress Fill - Fixed to show actual progress */}
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-info-color to-primary-color rounded-full shadow-outset-subtle"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    boxShadow: '0 0 10px rgba(94, 129, 172, 0.3)'
                  }}
                />
                
                {/* Shimmer Effect */}
                {!isComplete && (
                  <motion.div
                    className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: [-64, 400] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>
            </div>
            
            {/* Stage Indicators */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Validate', threshold: 20, icon: '🔍' },
                { label: 'Load', threshold: 40, icon: '📁' },
                { label: 'Process', threshold: 60, icon: '⚙️' },
                { label: 'Setup', threshold: 80, icon: '🔧' },
                { label: 'Complete', threshold: 100, icon: '✅' }
              ].map((stage, index) => (
                <motion.div
                  key={stage.label}
                  className={`text-center p-2 rounded-lg transition-all duration-300 ${
                    progress >= stage.threshold 
                      ? 'bg-info-color/10 shadow-inset-subtle text-info-color' 
                      : 'bg-surface shadow-outset-subtle text-text-secondary'
                  }`}
                  animate={{
                    scale: progress >= stage.threshold ? 1.05 : 1,
                    filter: progress >= stage.threshold ? 'brightness(1.1)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-lg mb-1">{stage.icon}</div>
                  <div className="text-xs font-medium">{stage.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-info-color/30 rounded-full" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-info-color/20 rounded-full" />
        </motion.div>
      </div>
    </Portal>
  );
};