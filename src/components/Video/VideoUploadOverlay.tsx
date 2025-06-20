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
      <motion.div 
        {...getRootProps()} 
        className={`flex-1 flex flex-col items-center justify-center m-4 rounded-2xl transition-all duration-300 cursor-pointer ${
          isDragActive 
            ? 'neu-shadow-inset scale-105' 
            : 'neu-shadow-1 hover:neu-shadow-2'
        }`}
        style={{
          background: isDragActive 
            ? 'var(--neu-base)' 
            : 'linear-gradient(145deg, var(--neu-base), var(--neu-accent))',
          border: `2px dashed ${isDragActive ? 'var(--neu-primary)' : 'var(--neu-dark)'}`
        }}

        transition={{ duration: 0.2 }}
      >
        <input {...getInputProps()} />
        
        <motion.div

          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <motion.div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center ${
              isDragActive ? 'neu-shadow-2' : ''
            }`}
            style={{
              background: isDragActive 
                ? 'var(--neu-primary)' 
                : 'linear-gradient(145deg, var(--neu-light), var(--neu-accent))'
            }}
            animate={isDragActive ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
          >
            <Upload className={`w-8 h-8 ${
              isDragActive ? 'text-white' : 'neu-text-secondary'
            }`} />
          </motion.div>
          
          <h3 className={`text-lg font-medium mb-2 ${
            isDragActive ? 'neu-text-primary' : 'neu-text-primary'
          }`}>
            {isDragActive ? 'Drop your video here' : 'Upload Video File'}
          </h3>
          
          <p className={`text-sm mb-3 ${
            isDragActive ? 'neu-text-accent' : 'neu-text-secondary'
          }`}>
            {isDragActive 
              ? 'Release to upload your video file'
              : 'Drag & drop a video file here, or click to browse'
            }
          </p>
          
          <div className="neu-card-small p-3 space-y-1">
            <p className="neu-caption">Supported formats: MP4, WebM, OGG, MOV, AVI, MKV, M4V</p>
            <p className="neu-caption">Maximum file size: 500MB</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};