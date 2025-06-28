import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, FileVideo, AlertCircle, Check } from 'lucide-react';

interface LargeVideoWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileSize: number;
}

export const LargeVideoWarningModal: React.FC<LargeVideoWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileSize
}) => {
  if (!isOpen) return null;
  
  const fileSizeMB = Math.round(fileSize / (1024 * 1024));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-dark-color border border-darker-color rounded-lg shadow-outset max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-darker-color bg-darker-color">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-color/80 rounded-lg flex items-center justify-center shadow-inset">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Performance Warning</h2>
              <p className="text-sm text-text-secondary">Large video file detected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-darker-color transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File Size Info */}
          <div className="bg-darker-color rounded-lg p-4 shadow-inset-subtle">
            <div className="flex items-center gap-3 mb-3">
              <FileVideo className="w-5 h-5 text-warning-color" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Selected File Size</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-warning-color">{fileSizeMB} MB</span>
                  <span className="text-xs text-text-secondary">(Recommended: <500 MB)</span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-darker-color rounded-full shadow-inset-subtle overflow-hidden">
              <div 
                className="h-full bg-warning-color/80"
                style={{ width: `${Math.min(100, (fileSizeMB / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-3">
            <p className="text-sm text-text-primary">
              The selected video file exceeds the recommended size of 500MB. Large files may cause:
            </p>
            
            <ul className="space-y-2">
              {[
                { icon: AlertCircle, text: "Slower processing and loading times" },
                { icon: AlertCircle, text: "Increased memory usage" },
                { icon: AlertCircle, text: "Potential browser performance issues" },
                { icon: AlertCircle, text: "Risk of application crashes on lower-end devices" }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <item.icon className="w-4 h-4 text-warning-color/80 mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-success-color/5 border border-success-color/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-success-color/90 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Recommendations
            </h3>
            <ul className="space-y-1 text-xs text-text-secondary">
              <li>• Consider using a smaller or compressed video file</li>
              <li>• Trim the video to include only the necessary sections</li>
              <li>• Close other browser tabs to free up memory</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-darker-color bg-darker-color">
          <button
            onClick={onClose}
            className="btn px-4 py-2 text-text-secondary hover:text-text-primary bg-darker-color border-darker-color shadow-inset"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onConfirm}
              className="btn px-6 py-2 bg-warning-color/70 text-white border-warning-color/50 hover:bg-warning-color/80 shadow-inset"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};