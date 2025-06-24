import React, { useRef, useEffect, useState } from 'react';
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const { currentProject } = useProjectStore();
  const { error } = useToast();
  
  const { uploadState, processVideoFile } = useVideoUpload(videoRef);
  useVideoSync(videoRef, isVideoLoaded);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 비디오 엘리먼트 스타일 직접 설정
    video.style.display = 'block';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.style.backgroundColor = 'var(--neu-base)';

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

  return (
    <div 
      className="h-full w-full min-w-0 min-h-0 flex flex-col neu-bg-base neu-video-panel"
      style={{
        borderRadius: '18px',
        transition: 'all 0.2s ease'
      }}
      // 🎯 드래그 앤 드롭만 전체 패널에 적용
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      
      <div className="flex-1 w-full h-full min-w-0 min-h-0 relative">
        <VideoPreviewPlayer
          videoRef={videoRef}
          hasVideo={hasVideo}
          videoUrl={currentProject?.videoMeta?.url}
        />
        
        {/* 🎯 비디오가 없을 때만 클릭 가능한 업로드 영역 */}
        {!hasVideo && !uploadState.isUploading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-30"
            onClick={handleManualFileSelect}
            style={{
              cursor: 'pointer',
              background: isDragActive ? 'rgba(99, 179, 237, 0.1)' : 'transparent',
              borderRadius: '18px',
              transition: 'background 0.2s ease'
            }}
          >
            {/* 🎯 드래그 활성화 시에만 메시지 표시 */}
            {isDragActive && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
                     style={{ background: 'var(--neu-primary)' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium neu-text-primary">Drop video here</h3>
              </div>
            )}
          </div>
        )}
        
        <VideoPreviewOverlays
          hasVideo={!!hasVideo}
          uploadState={uploadState}
          isVideoLoaded={isVideoLoaded}
          videoError={videoError}
          isDragActive={isDragActive}
          getRootProps={() => ({})} // 🎯 빈 객체 반환으로 중복 방지
          getInputProps={() => ({})} // 🎯 빈 객체 반환으로 중복 방지
          onRetry={handleRetry}
        />
      </div>
      
      <VideoPreviewController
        isVideoLoaded={isVideoLoaded}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onSettings={handleSettings}
      />
    </div>
  );
};