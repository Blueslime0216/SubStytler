import React from 'react';
import { VideoOverlays } from '../Video/VideoOverlays';

interface VideoPreviewOverlaysProps {
  isLoading: boolean;
  uploadProgress: number;
  hasVideo: boolean;
  videoError: string | null;
  isDragActive: boolean;
  onRetry: () => void;
  onUpload: () => void;
  isVideoLoaded?: boolean;
}

const VideoPreviewOverlays: React.FC<VideoPreviewOverlaysProps> = ({
  isLoading,
  uploadProgress,
  hasVideo,
  videoError,
  isDragActive,
  onRetry,
  onUpload,
  isVideoLoaded
}) => (
  <VideoOverlays 
    isLoading={isLoading}
    uploadProgress={uploadProgress}
    hasVideo={hasVideo}
    videoError={videoError}
    isDragActive={isDragActive}
    onRetry={onRetry}
    onUpload={onUpload}
    isVideoLoaded={isVideoLoaded}
  />
);

export default VideoPreviewOverlays; 