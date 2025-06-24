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

  // Dropzone setup - 전체 패널에 적용
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
    disabled: uploadState.isUploading
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

  const hasVideo = !!(currentProject?.videoMeta && currentProject.videoMeta.url);
  const [forceRender, setForceRender] = useState(0);

  // 비디오 메타가 바뀔 때마다 강제로 리렌더링하고 isVideoLoaded를 초기화
  useEffect(() => {
    setForceRender(f => f + 1);
    // 새 비디오가 설정되면 로드 상태 초기화
    setIsVideoLoaded(false);
    
    // 디버깅: 비디오 메타데이터 변경 로깅
    console.log('Video metadata changed:', {
      hasUrl: !!currentProject?.videoMeta?.url,
      url: currentProject?.videoMeta?.url?.substring(0, 30) + '...',
      duration: currentProject?.videoMeta?.duration,
      dimensions: currentProject?.videoMeta ? 
        `${currentProject.videoMeta.width}x${currentProject.videoMeta.height}` : 'none'
    });
    
    // 비디오 엘리먼트에 URL 직접 설정
    if (videoRef.current && currentProject?.videoMeta?.url) {
      videoRef.current.src = currentProject.videoMeta.url;
      videoRef.current.load();
    }
  }, [currentProject?.videoMeta]);

  // 비디오 로드 상태 디버깅
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 드롭존 적용 여부 결정 
  // 비디오가 없거나, 비디오가 있지만 로드되지 않았을 때만 드롭존 활성화
  const shouldEnableDropzone = !hasVideo;
  
  return (
    <div 
      className="h-full w-full min-w-0 min-h-0 flex flex-col neu-bg-base neu-video-panel"
      {...(shouldEnableDropzone ? getRootProps() : {})}
      style={{
        cursor: shouldEnableDropzone ? 'pointer' : 'default',
        background: isDragActive ? 'var(--neu-accent)' : 'var(--neu-base)',
        borderRadius: '18px',
        transition: 'all 0.2s ease'
      }}
    >
      {shouldEnableDropzone && <input {...getInputProps()} />}
      
      <div className="flex-1 w-full h-full min-w-0 min-h-0 relative">
        <VideoPreviewPlayer
          videoRef={videoRef}
          hasVideo={hasVideo}
          videoUrl={currentProject?.videoMeta?.url}
        />
        
        {/* 드래그 활성화 시에만 간단한 메시지 표시 */}
        {isDragActive && !hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-shadow-1 flex items-center justify-center"
                   style={{ background: 'var(--neu-primary)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium neu-text-primary">Drop video here</h3>
            </div>
          </div>
        )}
        
        <VideoPreviewOverlays
          hasVideo={!!hasVideo}
          uploadState={uploadState}
          isVideoLoaded={isVideoLoaded}
          videoError={videoError}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
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