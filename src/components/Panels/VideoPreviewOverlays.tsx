import React from 'react';
import { VideoOverlays } from '../Video/VideoOverlays';

interface VideoPreviewOverlaysProps {
  hasVideo: boolean;
  uploadState: any;
  isVideoLoaded: boolean;
  videoError: string | null;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  onRetry: () => void;
}

const VideoPreviewOverlays: React.FC<VideoPreviewOverlaysProps> = (props) => (
  <VideoOverlays {...props} />
);

export default VideoPreviewOverlays; 