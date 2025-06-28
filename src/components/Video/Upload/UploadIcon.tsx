import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo } from 'lucide-react';

interface UploadIconProps {
  isDragActive: boolean;
}

export const UploadIcon: React.FC<UploadIconProps> = ({ isDragActive }) => {
  return (
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
  );
};