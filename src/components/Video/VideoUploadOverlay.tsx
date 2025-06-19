import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

interface VideoUploadOverlayProps {
  isDragActive: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
}

export const VideoUploadOverlay: React.FC<VideoUploadOverlayProps> = ({
  isDragActive,
  getRootProps,
  getInputProps
}) => {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div 
        {...getRootProps()} 
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 transition-all duration-200 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-950/30 scale-105' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/20 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <Upload className={`w-16 h-16 mx-auto mb-4 ${
            isDragActive ? 'text-blue-400' : 'text-gray-400'
          }`} />
          
          <h3 className={`text-lg font-medium mb-2 ${
            isDragActive ? 'text-blue-300' : 'text-gray-300'
          }`}>
            {isDragActive ? 'Drop your video here' : 'Upload Video File'}
          </h3>
          
          <p className={`text-sm mb-2 ${
            isDragActive ? 'text-blue-400' : 'text-gray-500'
          }`}>
            Drag & drop a video file here, or click to browse
          </p>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>Supported formats: MP4, WebM, OGG, MOV, AVI, MKV, M4V</p>
            <p>Maximum file size: 500MB</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};