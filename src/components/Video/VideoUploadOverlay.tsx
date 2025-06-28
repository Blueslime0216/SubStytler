import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, FileVideo } from 'lucide-react';

interface VideoUploadOverlayProps {
  isDragActive: boolean;
  onUpload: () => void;
}

export const VideoUploadOverlay: React.FC<VideoUploadOverlayProps> = ({
  isDragActive,
  onUpload
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <motion.div 
        className="text-center cursor-pointer max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: isDragActive ? 1.05 : 1, 
          y: 0,
          filter: isDragActive ? 'brightness(1.1)' : 'brightness(1)'
        }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        onClick={onUpload}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
      >
        {/* Main Upload Card */}
        <div className="bg-surface border-2 border-border-color rounded-lg p-8 shadow-outset-strong relative overflow-hidden">
          {/* Background Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-surface/10 opacity-50" />
          
          {/* Drag Active Overlay */}
          {isDragActive && (
            <motion.div
              className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Content */}
          <div className="relative z-10">
            {/* Icon Container */}
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface shadow-outset flex items-center justify-center relative overflow-hidden"
              animate={{
                boxShadow: isDragActive 
                  ? 'var(--shadow-inset)' 
                  : 'var(--shadow-outset)',
                scale: isDragActive ? 0.95 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60" />
              
              {/* Animated Icon */}
              <motion.div
                animate={{
                  y: isDragActive ? -2 : 0,
                  rotate: isDragActive ? 5 : 0
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                {isDragActive ? (
                  <FileVideo className="w-10 h-10 text-primary" />
                ) : (
                  <Upload className="w-10 h-10 text-primary" />
                )}
              </motion.div>

              {/* Pulse Effect */}
              {isDragActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-primary"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>

            {/* Text Content */}
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

              {/* Supported Formats */}
              <div className="bg-base-color rounded-lg p-4 shadow-inset-subtle">
                <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                  Supported Formats
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['MP4', 'WebM', 'MOV', 'AVI', 'MKV'].map((format) => (
                    <span 
                      key={format}
                      className="px-2 py-1 bg-surface text-text-muted text-xs font-mono rounded shadow-outset-subtle"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            {!isDragActive && (
              <motion.button
                className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-outset border-2 border-primary transition-all duration-200"
                whileHover={{ 
                  filter: 'brightness(1.1)',
                  boxShadow: 'var(--shadow-outset-hover)'
                }}
                whileTap={{ 
                  boxShadow: 'var(--shadow-pressed)',
                  transform: 'translateY(1px)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload();
                }}
              >
                Browse Files
              </motion.button>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/20 rounded-full" />
          
          {/* Border Highlight */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-transparent"
            animate={{
              borderColor: isDragActive ? 'var(--primary-color)' : 'transparent'
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Additional Info */}
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-text-muted">
            Maximum file size: 500MB
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};