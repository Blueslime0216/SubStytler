import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { useVideoSync } from '../../hooks/useVideoSync';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import VideoPreviewPlayer from './VideoPreviewPlayer';
import VideoPreviewOverlays from './VideoPreviewOverlays';
import VideoPreviewController from './VideoPreviewController';
import { useToast } from '../../hooks/useToast';
import { LargeVideoWarningModal } from '../UI/LargeVideoWarningModal';

export const VideoPreviewPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const { currentProject, triggerUploadCounter } = useProjectStore();
  const { error } = useToast();
  
  const { 
    uploadState, 
    processVideoFile, 
    showSizeWarning, 
    pendingLargeFile,
    confirmLargeFileUpload,
    cancelLargeFileUpload
  } = useVideoUpload(videoRef);
  
  useVideoSync(videoRef, isVideoLoaded);

  const videoAreaRef = useRef<HTMLDivElement>(null);
  const [clippingContainerStyle, setClippingContainerStyle] = useState({});
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  
  // Track if we've already processed the current trigger count
  const processedTriggerRef = useRef<number>(0);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      setVideoError(null);
    };

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      setVideoError(null);
    };

    const handleError = (e: Event) => {
      console.error('Video playback error:', e);
      const errorMsg = 'Video playback error occurred';
      setVideoError(errorMsg);
      setIsVideoLoaded(false);
      error({
        title: 'Video playback error',
        message: errorMsg
      });
    };

    const handleLoadStart = () => {
      setVideoError(null);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [error]);

  // Volume control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  // 🎯 Dropzone setup - updated for larger files
  const onDrop = React.useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File rejected';
      
      if (rejection.errors) {
        const errorObj = rejection.errors[0];
        if (errorObj.code === 'file-too-large') {
          errorMessage = 'File is too large. Maximum size is 5GB';
        } else if (errorObj.code === 'file-invalid-type') {
          errorMessage = 'Invalid file type. Please select a video file';
        } else {
          errorMessage = errorObj.message || 'File rejected';
        }
      }
      
      error({
        title: 'File upload rejected',
        message: errorMessage
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      processVideoFile(file);
    }
  }, [processVideoFile, error]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB maximum
    disabled: uploadState.isUploading,
    noClick: true, // 🎯 기본 클릭 비활성화
    noKeyboard: true // 키보드 이벤트도 비활성화
  });

  // Handle programmatic video upload trigger with proper dependency tracking
  useEffect(() => {
    // Only open file dialog if this is a new trigger count and we're not already uploading
    if (triggerUploadCounter > 0 && 
        triggerUploadCounter !== processedTriggerRef.current && 
        !uploadState.isUploading) {
      // Update the processed trigger reference
      processedTriggerRef.current = triggerUploadCounter;
      // Use setTimeout to break the render cycle and prevent infinite loop
      setTimeout(() => {
        open();
      }, 0);
    }
  }, [triggerUploadCounter, open, uploadState.isUploading]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSettings = () => {
    console.log('Open video settings');
  };

  const handleRetry = () => {
    setVideoError(null);
    setIsVideoLoaded(false);
    if (videoRef.current && currentProject?.videoMeta?.file) {
      videoRef.current.src = URL.createObjectURL(currentProject.videoMeta.file);
      videoRef.current.load();
    }
  };

  // 🎯 수동 파일 선택 핸들러 (중복 방지)
  const handleManualFileSelect = React.useCallback(() => {
    if (uploadState.isUploading) return;
    open();
  }, [uploadState.isUploading, open]);

  const hasVideo = !!(currentProject?.videoMeta && currentProject.videoMeta.file);
  const [forceRender, setForceRender] = useState(0);

  // 비디오 메타가 바뀔 때마다 강제로 리렌더링하고 isVideoLoaded를 초기화
  useEffect(() => {
    setForceRender(f => f + 1);
    setIsVideoLoaded(false);
    
    if (videoRef.current && currentProject?.videoMeta?.file) {
      videoRef.current.src = URL.createObjectURL(currentProject.videoMeta.file);
      videoRef.current.load();
    }
  }, [currentProject?.videoMeta]);

  // 컨트롤러 위치 동적 계산 -> 클리핑 컨테이너 크기 계산으로 변경
  useLayoutEffect(() => {
    const areaEl = videoAreaRef.current;
    if (!areaEl) return;

    const observer = new ResizeObserver(() => {
      const videoMeta = currentProject?.videoMeta;
      if (!videoMeta || !areaEl) {
        setClippingContainerStyle({ width: '100%', height: '100%' });
        return;
      }

      const panelWidth = areaEl.clientWidth;
      const panelHeight = areaEl.clientHeight;
      if (panelWidth === 0 || panelHeight === 0) return;

      const panelAspectRatio = panelWidth / panelHeight;
      const videoAspectRatio = videoMeta.width / videoMeta.height;

      let style = {};
      if (panelAspectRatio > videoAspectRatio) {
        // 패널이 비디오보다 가로로 길다 (좌우에 여백 - 필러박스)
        const videoRenderedWidth = panelHeight * videoAspectRatio;
        style = {
          width: `${videoRenderedWidth}px`,
          height: '100%',
        };
      } else {
        // 패널이 비디오보다 세로로 길다 (상하에 여백 - 레터박스)
        const videoRenderedHeight = panelWidth / videoAspectRatio;
        style = {
          width: '100%',
          height: `${videoRenderedHeight}px`,
        };
      }
      setClippingContainerStyle(style);
    });

    observer.observe(areaEl);
    return () => observer.disconnect();
  }, [currentProject?.videoMeta]);

  useEffect(() => {
    const file = currentProject?.videoMeta?.file;
    if (!file) {
      setVideoUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  }, [currentProject?.videoMeta?.file]);

  return (
    <div 
      ref={panelRef}
      className="h-full w-full min-w-0 min-h-0 flex flex-col neu-bg-base neu-video-panel"
      style={{
        borderRadius: '18px',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        background: 'var(--base-color)'
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div 
        ref={videoAreaRef} 
        className="neu-video-area"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--base-color)',
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            ...clippingContainerStyle,
          }}
        >
          <VideoPreviewPlayer
            videoRef={videoRef}
            hasVideo={hasVideo}
            videoUrl={videoUrl}
          />
          
          {/* Subtitles and controller are now both inside the clipping container */}
          {hasVideo && (
            <VideoPreviewController
              isVideoLoaded={isVideoLoaded}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onSettings={handleSettings}
              parentRef={videoAreaRef}
            />
          )}
          
          {/* Video overlays including subtitles - now inside the clipping container */}
          <VideoPreviewOverlays
            isLoading={uploadState.isUploading}
            uploadProgress={uploadState.uploadProgress}
            hasVideo={hasVideo}
            videoError={videoError}
            onRetry={handleRetry}
            onUpload={handleManualFileSelect}
            isDragActive={isDragActive}
            isVideoLoaded={isVideoLoaded}
          />
        </div>
      </div>

      {/* Large Video Warning Modal */}
      {pendingLargeFile && (
        <LargeVideoWarningModal
          isOpen={showSizeWarning}
          onClose={cancelLargeFileUpload}
          onConfirm={confirmLargeFileUpload}
          fileSize={pendingLargeFile.size}
        />
      )}
    </div>
  );
};