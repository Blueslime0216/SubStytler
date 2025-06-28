import React from 'react';
import { UploadCard } from './Upload/UploadCard';

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
      <UploadCard 
        isDragActive={isDragActive} 
        onUpload={onUpload} 
      />
    </div>
  );
};