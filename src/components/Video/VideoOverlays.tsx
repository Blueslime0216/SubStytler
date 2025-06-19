import React from 'react';
import { VideoUploadOverlay } from './VideoUploadOverlay';
import { VideoProgressOverlay } from './VideoProgressOverlay';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';
import { VideoErrorOverlay } from './VideoErrorOverlay';
import { SubtitleOverlay } from './SubtitleOverlay';

interface VideoOverlaysProps {
  hasVideo: any;
  uploadState: any;
  isVideoLoaded: boolean;
  videoError: string | null;
  isDragActive: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
  onRetry: () => void;
}

export const VideoOverlays: React.FC<VideoOverlaysProps> = ({
  hasVideo,
  uploadState,
  isVideoLoaded,
  videoError,
  isDragActive,
  getRootProps,
  getInputProps,
  onRetry
}) => {
  const showUploadInterface = !hasVideo && !uploadState.isUploading;

  return (
    <>
      {showUploadInterface && (
        <VideoUploadOverlay
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />
      )}

      <VideoProgressOverlay uploadState={uploadState} />
      
      <VideoLoadingOverlay 
        isLoading={hasVideo && !isVideoLoaded && !videoError && !uploadState.isUploading} 
      />

      <VideoErrorOverlay 
        error={videoError} 
        onRetry={onRetry} 
      />
      
      {isVideoLoaded && !videoError && <SubtitleOverlay />}
    </>
  );
};