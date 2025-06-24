import React from 'react';
import { motion } from 'framer-motion';

interface VideoUploadOverlayProps {
  isDragActive: boolean;
  onUpload: () => void;
}

export const VideoUploadOverlay: React.FC<VideoUploadOverlayProps> = ({
  isDragActive,
  onUpload
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div 
        className="text-center cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onUpload}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
             style={{ background: 'var(--neu-primary)' }}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-xl font-medium neu-text-primary">Upload Video</h3>
        <p className="neu-text-secondary mt-2">Click or drag and drop a video file</p>
      </motion.div>
    </div>
  );
};