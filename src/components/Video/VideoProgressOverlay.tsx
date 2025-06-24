import React from 'react';
import { motion } from 'framer-motion';

interface VideoUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;
}

interface VideoProgressOverlayProps {
  uploadState: VideoUploadState;
}

export const VideoProgressOverlay: React.FC<VideoProgressOverlayProps> = ({
  uploadState
}) => {
  if (!uploadState.isUploading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center neu-bg-base/70 backdrop-blur-sm z-20">
      <motion.div 
        className="neu-card max-w-md w-full mx-4 p-6"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div 
            className="w-5 h-5 neu-shadow-inset rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                background: `conic-gradient(var(--neu-primary) ${uploadState.uploadProgress * 3.6}deg, var(--neu-accent) 0deg)`
              }}
            />
          </motion.div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="neu-body-primary text-sm font-medium">Loading Video</span>
              <span className="neu-text-accent text-sm font-mono">{uploadState.uploadProgress}%</span>
            </div>
            <p className="neu-caption text-xs">{uploadState.uploadStage}</p>
          </div>
        </div>
        
        {/* Enhanced Neumorphism Progress Bar */}
        <div className="neu-progress-container mb-4">
          <div className="neu-progress-track" />
          <motion.div 
            className="neu-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${uploadState.uploadProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        
        {/* Stage indicators with neumorphism */}
        <div className="flex justify-between text-xs">
          {[
            { label: 'Validate', threshold: 20 },
            { label: 'Load', threshold: 40 },
            { label: 'Process', threshold: 60 },
            { label: 'Setup', threshold: 80 },
            { label: 'Complete', threshold: 100 }
          ].map((stage, index) => (
            <motion.div
              key={stage.label}
              className={`neu-card-micro px-2 py-1 transition-all duration-300 ${
                uploadState.uploadProgress >= stage.threshold 
                  ? 'neu-text-primary' 
                  : 'neu-text-secondary'
              }`}
              animate={{
                scale: uploadState.uploadProgress >= stage.threshold ? 1.05 : 1,
                boxShadow: uploadState.uploadProgress >= stage.threshold 
                  ? 'var(--neu-shadow-1)' 
                  : 'var(--neu-shadow-micro)'
              }}
              transition={{ duration: 0.2 }}
            >
              {stage.label}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};