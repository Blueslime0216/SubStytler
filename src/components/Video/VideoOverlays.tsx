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
  // 🔧 비디오가 성공적으로 로드되었는지 확인
  const videoSuccessfullyLoaded = hasVideo && isVideoLoaded && !videoError;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none video-overlay">
      {/* 🔧 비디오가 성공적으로 로드되지 않았을 때만 오버레이 표시 */}
      {!videoSuccessfullyLoaded && (
        <>
          {/* 🔧 업로드 중일 때만 프로그레스 표시 */}
          {uploadState.isUploading && (
            <VideoProgressOverlay uploadState={uploadState} />
          )}
          
          {/* 🔧 비디오가 있지만 로드되지 않았을 때만 로딩 표시 */}
          {hasVideo && !isVideoLoaded && !videoError && !uploadState.isUploading && (
            <VideoLoadingOverlay isLoading={true} />
          )}

          {/* 🔧 에러가 있을 때만 에러 표시 */}
          {videoError && (
            <div className="pointer-events-auto">
              <VideoErrorOverlay error={videoError} onRetry={onRetry} />
            </div>
          )}
        </>
      )}
      
      {/* 🔧 자막 오버레이는 비디오가 성공적으로 로드되었을 때만 표시 */}
      {videoSuccessfullyLoaded && <SubtitleOverlay />}
    </div>
  );
};