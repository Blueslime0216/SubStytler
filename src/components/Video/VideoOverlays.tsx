import React from 'react';
import { VideoUploadOverlay } from './VideoUploadOverlay';
import { VideoProgressOverlay } from './VideoProgressOverlay';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';
import { VideoErrorOverlay } from './VideoErrorOverlay';
import { SubtitleOverlay } from './SubtitleOverlay';
import { useSubtitleVisibilityStore } from '../../stores/subtitleVisibilityStore';

interface VideoOverlaysProps {
  isLoading: boolean;
  uploadProgress: number;
  hasVideo: boolean;
  videoError: string | null;
  isDragActive: boolean;
  onRetry: () => void;
  onUpload: () => void;
  isVideoLoaded?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const VideoOverlays: React.FC<VideoOverlaysProps> = ({
  isLoading,
  uploadProgress,
  hasVideo,
  videoError,
  isDragActive,
  onRetry,
  onUpload,
  isVideoLoaded = false,
  containerRef
}) => {
  const { isSubtitleVisible } = useSubtitleVisibilityStore();
  return (
    <div className="absolute inset-0 z-20 pointer-events-none video-overlay">
      {/* 비디오가 없거나 에러가 있을 때 표시할 오버레이 */}
      {!hasVideo && !isLoading && (
        <div className="pointer-events-auto">
          <VideoUploadOverlay onUpload={onUpload} isDragActive={isDragActive} />
        </div>
      )}
      
      {/* 업로드 중 표시 */}
      {isLoading && (
        <VideoProgressOverlay progress={uploadProgress} />
          )}
          
      {/* 로딩 표시는 업로드 중이 아니고, 비디오가 로드되지 않았을 때만 */}
      {hasVideo && !videoError && !isLoading && !isVideoLoaded && (
            <VideoLoadingOverlay isLoading={true} />
          )}

      {/* 에러 표시 */}
          {videoError && (
            <div className="pointer-events-auto">
              <VideoErrorOverlay error={videoError} onRetry={onRetry} />
            </div>
      )}
      
      {/* 자막 오버레이 - 비디오가 로드되었고 자막이 켜져 있을 때만 표시 */}
      {hasVideo && !videoError && isVideoLoaded && isSubtitleVisible && <SubtitleOverlay containerRef={containerRef} />}
    </div>
  );
};