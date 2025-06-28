import React from 'react';
import { motion } from 'framer-motion';

interface UploadTextProps {
  isDragActive: boolean;
}

export const UploadText: React.FC<UploadTextProps> = ({ isDragActive }) => {
  return (
    <motion.div
      animate={{
        y: isDragActive ? -5 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold text-text-primary mb-3">
        {isDragActive ? 'Drop Video Here' : 'Upload Video'}
      </h3>
      
      <p className="text-text-secondary mb-6 leading-relaxed">
        {isDragActive 
          ? 'Release to upload your video file'
          : 'Drag and drop a video file or click to browse'
        }
      </p>
    </motion.div>
  );
};