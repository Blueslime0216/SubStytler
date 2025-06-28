import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertCircle, Video, Clock, Monitor, HardDrive } from 'lucide-react';
import { VideoInfo, formatFileSize, formatDuration, isValidVideoFile } from '../../utils/videoUtils';
import { useDropzone } from 'react-dropzone';

interface VideoReuploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoInfo: VideoInfo;
  onVideoSelected: (file: File) => void;
  onSkip: () => void;
}

export const VideoReuploadDialog: React.FC<VideoReuploadDialogProps> = ({
  isOpen,
  onClose,
  videoInfo,
  onVideoSelected,
  onSkip
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = React.useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      // Handle rejected files
      return;
    }

    const file = acceptedFiles[0];
    if (file && isValidVideoFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v']
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024, // 500MB
    noClick: true,
    noKeyboard: true
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidVideoFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onVideoSelected(selectedFile);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

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

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-surface border border-border-color rounded-lg shadow-outset-strong max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-color rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Video Required</h2>
              <p className="text-sm text-text-secondary">Please reselect the video file for this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Video Info */}
          <div className="bg-bg rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning-color" />
              Original Video Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thumbnail */}
              {videoInfo.thumbnail && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Preview</label>
                  <div className="relative">
                    <img
                      src={videoInfo.thumbnail.dataUrl}
                      alt="Video thumbnail"
                      className="w-full h-24 object-cover rounded-lg border border-border-color"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Title</label>
                  <p className="text-sm text-text-primary font-medium">{videoInfo.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </label>
                    <p className="text-sm text-text-primary">{formatDuration(videoInfo.duration)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      Resolution
                    </label>
                    <p className="text-sm text-text-primary">{videoInfo.width} × {videoInfo.height}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      Size
                    </label>
                    <p className="text-sm text-text-primary">{formatFileSize(videoInfo.size)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Filename</label>
                    <p className="text-sm text-text-primary truncate" title={videoInfo.filename}>
                      {videoInfo.filename}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Selection Area */}
          <div>
            <h3 className="font-medium text-text-primary mb-3">Select Replacement Video</h3>
            
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${isDragActive 
                  ? 'border-primary-color bg-primary-color/10' 
                  : 'border-border-color hover:border-primary-color/50'
                }
                ${selectedFile ? 'bg-success-color/10 border-success-color' : ''}
              `}
            >
              <input {...getInputProps()} />
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-success-color rounded-lg flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{selectedFile.name}</p>
                    <p className="text-sm text-text-secondary">
                      {formatFileSize(selectedFile.size)} • Ready to load
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary-color rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {isDragActive ? 'Drop video here' : 'Select video file'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Drag and drop or click to browse
                    </p>
                  </div>
                </div>
              )}

              {!selectedFile && (
                <button
                  onClick={handleFileSelect}
                  className="mt-4 btn px-6 py-2 bg-primary-color text-white border-primary-color hover:bg-primary-color/90"
                >
                  Browse Files
                </button>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-success-color/10 border border-success-color/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-success-color">
                  <Video className="w-4 h-4" />
                  <span>Video file selected and ready to load</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-color bg-bg/50">
          <button
            onClick={handleSkip}
            className="btn px-4 py-2 text-text-secondary hover:text-text-primary"
          >
            Skip Video
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn px-4 py-2 border border-border-color"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedFile}
              className="btn px-6 py-2 bg-primary-color text-white border-primary-color disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Video
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};