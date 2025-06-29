import { useCallback, useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useToast } from './useToast';

interface VideoUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;
}

export const useVideoUpload = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [uploadState, setUploadState] = useState<VideoUploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadStage: ''
  });

  const [pendingLargeFile, setPendingLargeFile] = useState<File | null>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  
  // FPS 확인 모달 상태
  const [showFpsConfirmation, setShowFpsConfirmation] = useState(false);
  const [detectedFps, setDetectedFps] = useState(30);
  const [pendingVideoData, setPendingVideoData] = useState<{
    file: File;
    metadata: any;
    url: string;
  } | null>(null);

  const { setVideoMeta, currentProject } = useProjectStore();
  const { setDuration, setFPS, setCurrentTime } = useTimelineStore();
  const { success, error, info, warning } = useToast();

  // Auto-close progress overlay when complete
  useEffect(() => {
    if (uploadState.uploadProgress >= 100) {
      const timer = setTimeout(() => {
        setUploadState({
          isUploading: false,
          uploadProgress: 0,
          uploadStage: ''
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [uploadState.uploadProgress]);

  const processVideoFile = useCallback(async (file: File) => {
    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      uploadStage: 'Validating file...'
    });

    try {
      // Stage 1: File validation
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }

      const recommendedSize = 500 * 1024 * 1024; // 500MB
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB absolute maximum

      // Check absolute maximum
      if (file.size > maxSize) {
        throw new Error('Video file is too large. Maximum size is 5GB');
      }

      // Check if file exceeds recommended size
      if (file.size > recommendedSize) {
        const fileSizeMB = Math.round(file.size / (1024 * 1024));
        
        // Store the file and show warning modal
        setPendingLargeFile(file);
        setShowSizeWarning(true);
        
        // Reset upload state while waiting for user decision
        setUploadState({
          isUploading: false,
          uploadProgress: 0,
          uploadStage: ''
        });
        
        return;
      }

      // Continue with normal upload process
      await continueVideoProcessing(file);

    } catch (uploadError) {
      console.error('Video upload error:', uploadError);
      
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to process video file';
      
      // Clean up on error
      if (videoRef.current) {
        videoRef.current.src = '';
      }
      
      // Show error toast
      error({
        title: 'Video upload failed',
        message: errorMessage
      });

      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        uploadStage: ''
      });
    }
  }, [videoRef]);

  const continueVideoProcessing = useCallback(async (file: File) => {
    try {
      setUploadState({
        isUploading: true,
        uploadProgress: 0,
        uploadStage: 'Validating file...'
      });

      // Show warning toast for large files
      if (file.size > 500 * 1024 * 1024) {
        const fileSizeMB = Math.round(file.size / (1024 * 1024));
        warning({
          title: 'Large File Warning',
          message: `Processing ${fileSizeMB}MB video file. This may take longer than usual and could impact performance.`,
          duration: 8000
        });
      }

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 20,
        uploadStage: 'Creating video URL...'
      }));

      // Stage 2: Create object URL
      const url = URL.createObjectURL(file);
      
      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 40,
        uploadStage: 'Loading video...'
      }));

      // Stage 3: Load video metadata
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not available');
      }

      // Set up video loading promise
      const videoLoadPromise = new Promise<{
        duration: number;
        width: number;
        height: number;
        fps: number;
      }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('Video loading timed out after 60 seconds');
          reject(new Error('Video loading timed out. This may be due to the large file size or unsupported format.'));
        }, 60000); // Increased timeout for large files

        // Function to detect FPS from video
        const detectFPS = async (videoElement: HTMLVideoElement): Promise<number> => {
          // Default fallback FPS
          let detectedFPS = 0;
          
          try {
            console.log('🎬 FPS 감지 시작...');
            
            // Try to get FPS from video properties if available
            // @ts-ignore - Some browsers expose this non-standard property
            if (videoElement.webkitDecodedFrameCount !== undefined && videoElement.duration) {
              // @ts-ignore
              const webkitFrames = videoElement.webkitDecodedFrameCount;
              detectedFPS = Math.round(webkitFrames / videoElement.duration);
              console.log('🎬 Webkit 속성으로 FPS 감지:', { webkitFrames, duration: videoElement.duration, detectedFPS });
            }
            
            // If detection failed or returned 0, use default
            if (detectedFPS <= 0) {
              console.log('🎬 FPS 감지 실패, 기본값 30 사용');
              detectedFPS = 30;
            }
          } catch (e) {
            console.warn('🎬 FPS 감지 중 오류 발생:', e);
            detectedFPS = 30; // 오류 발생 시 기본값
          }
          
          return detectedFPS;
        };

        const handleLoadedMetadata = async () => {
          cleanup();
          
          const duration = video.duration;
          const width = video.videoWidth;
          const height = video.videoHeight;

          if (duration <= 0) {
            console.error('Invalid video duration:', duration);
            reject(new Error('Invalid video duration'));
            return;
          }

          if (width <= 0 || height <= 0) {
            console.error('Invalid video dimensions:', { width, height });
            reject(new Error('Invalid video dimensions'));
            return;
          }

          // Detect FPS
          const fps = await detectFPS(video);

          resolve({
            duration: duration * 1000, // Convert to milliseconds
            width,
            height,
            fps
          });
        };

        const handleError = (e: Event) => {
          cleanup();
          console.error('Video loading error:', e);
          reject(new Error('Failed to load video. The file may be corrupted, in an unsupported format, or too large for your device to handle.'));
        };

        const cleanup = () => {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
        };

        // Add event listeners
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        video.addEventListener('error', handleError, { once: true });

        // Start loading
        video.src = url;
        video.preload = 'metadata';
        video.load();
      });

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 60,
        uploadStage: 'Processing metadata...'
      }));
      
      const metadata = await videoLoadPromise;
      
      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 80,
        uploadStage: 'Setting up timeline...'
      }));

      // 비정상적인 FPS 값 확인 (5 미만 또는 10 미만이면서 일반적인 값이 아닌 경우)
      const isAbnormalFps = metadata.fps < 5 || 
                           (metadata.fps < 10 && ![23.976, 24, 25, 29.97, 30].includes(metadata.fps));
      
      if (isAbnormalFps) {
        // FPS 확인 모달 표시를 위해 현재 처리 중인 데이터 저장
        setPendingVideoData({
          file,
          metadata,
          url
        });
        setDetectedFps(metadata.fps);
        setShowFpsConfirmation(true);
        
        // 업로드 상태 초기화
        setUploadState({
          isUploading: false,
          uploadProgress: 0,
          uploadStage: ''
        });
        
        return;
      }

      // 정상적인 FPS 값이면 바로 처리 완료
      finalizeVideoProcessing(file, metadata, url);

    } catch (err) {
      console.error('Video processing error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video file';
      
      // Clean up on error
      if (videoRef.current) {
        videoRef.current.src = '';
      }
      
      // Show error toast
      error({
        title: 'Video processing failed',
        message: errorMessage
      });

      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        uploadStage: ''
      });
    }
  }, [setVideoMeta, setDuration, setFPS, setCurrentTime, success, error, warning, videoRef]);

  // FPS 확인 후 최종 처리 함수
  const finalizeVideoProcessing = useCallback((file: File, metadata: any, url: string) => {
    // Stage 4: Update stores with metadata
    setVideoMeta({
      filename: file.name,
      duration: metadata.duration,
      fps: metadata.fps,
      width: metadata.width,
      height: metadata.height,
      file
    });

    setDuration(metadata.duration);
    setFPS(metadata.fps);
    setCurrentTime(0); // Reset to beginning

    setUploadState(prev => ({ 
      ...prev, 
      uploadProgress: 100,
      uploadStage: 'Complete!'
    }));

    // Show success toast
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    success({
      title: 'Video loaded successfully!',
      message: `${file.name} (${Math.round(metadata.duration / 1000)}s, ${metadata.width}×${metadata.height}, ${fileSizeMB}MB, ${metadata.fps}fps)`
    });
  }, [setVideoMeta, setDuration, setFPS, setCurrentTime, success]);

  // FPS 확인 모달에서 사용자가 확인 버튼을 눌렀을 때
  const handleFpsConfirm = useCallback((confirmedFps: number) => {
    if (!pendingVideoData) return;
    
    const { file, metadata, url } = pendingVideoData;
    
    // 사용자가 확인한 FPS 값으로 업데이트
    const updatedMetadata = {
      ...metadata,
      fps: confirmedFps
    };
    
    // 최종 처리 진행
    finalizeVideoProcessing(file, updatedMetadata, url);
    
    // 상태 초기화
    setShowFpsConfirmation(false);
    setPendingVideoData(null);
  }, [pendingVideoData, finalizeVideoProcessing]);

  const confirmLargeFileUpload = useCallback(() => {
    if (pendingLargeFile) {
      continueVideoProcessing(pendingLargeFile);
      setPendingLargeFile(null);
      setShowSizeWarning(false);
    }
  }, [pendingLargeFile, continueVideoProcessing]);

  const cancelLargeFileUpload = useCallback(() => {
    setPendingLargeFile(null);
    setShowSizeWarning(false);
  }, []);

  return {
    uploadState,
    processVideoFile,
    showSizeWarning,
    pendingLargeFile,
    confirmLargeFileUpload,
    cancelLargeFileUpload,
    showFpsConfirmation,
    detectedFps,
    handleFpsConfirm
  };
};