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
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-blue-200 text-sm font-medium">Loading Video</span>
              <span className="text-blue-300 text-sm">{uploadState.uploadProgress}%</span>
            </div>
            <p className="text-blue-300 text-xs">{uploadState.uploadStage}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${uploadState.uploadProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        
        {/* Stage indicators */}
        <div className="flex justify-between mt-2 text-xs text-blue-400">
          <span className={uploadState.uploadProgress >= 20 ? 'text-blue-300' : ''}>Validate</span>
          <span className={uploadState.uploadProgress >= 40 ? 'text-blue-300' : ''}>Load</span>
          <span className={uploadState.uploadProgress >= 60 ? 'text-blue-300' : ''}>Process</span>
          <span className={uploadState.uploadProgress >= 80 ? 'text-blue-300' : ''}>Setup</span>
          <span className={uploadState.uploadProgress >= 100 ? 'text-blue-300' : ''}>Complete</span>
        </div>
      </div>
    </div>
  );
};