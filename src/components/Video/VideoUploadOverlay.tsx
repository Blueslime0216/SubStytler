import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="absolute inset-0 flex flex-col z-10">
      <motion.div 
        {...getRootProps()} 
        className={`flex-1 flex flex-col items-center justify-center m-4 rounded-2xl transition-all duration-300 cursor-pointer ${
          isDragActive 
            ? 'neu-shadow-inset scale-105' 
            : ''
        }`}
        style={{
          background: isDragActive 
            ? 'var(--neu-base)' 
            : 'var(--neu-base)', // 기본 배경색과 동일
          border: isDragActive 
            ? `2px dashed var(--neu-primary)` 
            : '2px dashed transparent', // 평상시에는 투명한 테두리
        }}
        transition={{ duration: 0.2 }}
      >
        <input {...getInputProps()} />
        
        {/* 드래그 활성화 시에만 표시되는 메시지 */}
        {isDragActive && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
              style={{
                background: 'var(--neu-primary)'
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            
            <h3 className="text-lg font-medium mb-2 neu-text-primary">
              Drop your video here
            </h3>
            
            <p className="text-sm neu-text-accent">
              Release to upload your video file
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};