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

export const VideoPreviewPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const { currentProject } = useProjectStore();
  const { error } = useToast();
  
  const { uploadState, processVideoFile } = useVideoUpload(videoRef);
  useVideoSync(videoRef, isVideoLoaded);

  const videoAreaRef = useRef<HTMLDivElement>(null);
  const [controllerBottomOffset, setControllerBottomOffset] = useState(0);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log('Video can play event triggered');
      setIsVideoLoaded(true);
      setVideoError(null);
    };

    const handleLoadedData = () => {
      console.log('Video loaded data event triggered');
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
      console.log('Video load start event triggered');
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

  // 🎯 Dropzone setup - 중복 방지 및 영역 제한
  const onDrop = React.useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File rejected';
      
      if (rejection.errors) {
        const errorObj = rejection.errors[0];
        if (errorObj.code === 'file-too-large') {
          errorMessage = 'File is too large. Maximum size is 500MB';
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v']
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024,
    disabled: uploadState.isUploading,
    noClick: true, // 🎯 기본 클릭 비활성화
    noKeyboard: true // 키보드 이벤트도 비활성화
  });

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
    if (videoRef.current && currentProject?.videoMeta?.url) {
      videoRef.current.src = currentProject.videoMeta.url;
      videoRef.current.load();
    }
  };

  // 🎯 수동 파일 선택 핸들러 (중복 방지)
  const handleManualFileSelect = React.useCallback(() => {
    if (uploadState.isUploading) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processVideoFile(file);
      }
    };
    input.click();
  }, [uploadState.isUploading, processVideoFile]);

  const hasVideo = !!(currentProject?.videoMeta && currentProject.videoMeta.url);
  const [forceRender, setForceRender] = useState(0);

  // 비디오 메타가 바뀔 때마다 강제로 리렌더링하고 isVideoLoaded를 초기화
  useEffect(() => {
    setForceRender(f => f + 1);
    setIsVideoLoaded(false);
    
    console.log('Video metadata changed:', {
      hasUrl: !!currentProject?.videoMeta?.url,
      url: currentProject?.videoMeta?.url?.substring(0, 30) + '...',
      duration: currentProject?.videoMeta?.duration,
      dimensions: currentProject?.videoMeta ? 
        `${currentProject.videoMeta.width}x${currentProject.videoMeta.height}` : 'none'
    });
    
    if (videoRef.current && currentProject?.videoMeta?.url) {
      videoRef.current.src = currentProject.videoMeta.url;
      videoRef.current.load();
    }
  }, [currentProject?.videoMeta]);

  useEffect(() => {
    console.log('Video loaded state:', { isVideoLoaded, videoError, hasVideo });
  }, [isVideoLoaded, videoError, hasVideo]);

  // Object URL 해제는 언마운트 시점에만
  useEffect(() => {
    const urlToRevoke = currentProject?.videoMeta?.url;
    return () => {
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, []);

  // 컨트롤러 위치 동적 계산
  useLayoutEffect(() => {
    const areaEl = videoAreaRef.current;
    if (!areaEl) return;

    const observer = new ResizeObserver(() => {
      const videoMeta = currentProject?.videoMeta;
      if (!videoMeta || !areaEl) return;

      const panelWidth = areaEl.clientWidth;
      const panelHeight = areaEl.clientHeight;
      if (panelWidth === 0 || panelHeight === 0) return;

      const panelAspectRatio = panelWidth / panelHeight;
      const videoAspectRatio = videoMeta.width / videoMeta.height;

      let offset = 0;
      if (panelAspectRatio < videoAspectRatio) {
        // 패널이 비디오보다 세로로 길다 (좌우에 여백)
        const videoRenderedHeight = panelWidth / videoAspectRatio;
        offset = (panelHeight - videoRenderedHeight) / 2;
      }
      // 패널이 비디오보다 가로로 길면 (상하에 여백), 오프셋은 0

      setControllerBottomOffset(offset);
    });

    observer.observe(areaEl);
    return () => observer.disconnect();
  }, [currentProject?.videoMeta]);

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
          background: 'var(--base-color)'
        }}
      >
        <VideoPreviewPlayer
          videoRef={videoRef}
          hasVideo={hasVideo}
          videoUrl={currentProject?.videoMeta?.url}
        />
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
        {!hasVideo && !uploadState.isUploading && (
          <div 
            className="neu-video-upload-overlay"
            onClick={handleManualFileSelect}
            style={{
              cursor: 'pointer',
              background: isDragActive ? 'rgba(99, 179, 237, 0.1)' : 'transparent',
              borderRadius: '18px',
              transition: 'background 0.2s ease',
              position: 'absolute',
              inset: 0,
              zIndex: 30
            }}
          >
            {isDragActive && (
              // 수정 전
              // <div className="text-center">
              //   <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
              //        style={{ background: 'var(--neu-primary)' }}>
              //     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <div className="neu-video-upload-message">
                <div className="neu-shadow-1 neu-video-upload-icon">
                  <svg className="neu-video-upload-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                {/* 수정 전 <h3 className="text-lg font-medium neu-text-primary">Drop video here</h3> */}
                <h3 className="neu-text-primary">Drop video here</h3>
              </div>
            )}
          </div>
        )}
        {hasVideo && (
          <VideoPreviewController
            isVideoLoaded={isVideoLoaded}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            onSettings={handleSettings}
            parentRef={videoAreaRef}
            bottomOffset={controllerBottomOffset}
          />
        )}
      </div>
    </div>
  );
};