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
        fps: number; // Added FPS detection
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
            if (videoElement.mozDecodedFrames !== undefined && 
                // @ts-ignore
                videoElement.mozParsedFrames !== undefined && 
                videoElement.duration) {
              // @ts-ignore
              const mozFrames = videoElement.mozDecodedFrames || videoElement.mozParsedFrames;
              detectedFPS = Math.round(mozFrames / videoElement.duration);
              console.log('🎬 Mozilla 속성으로 FPS 감지:', { mozFrames, duration: videoElement.duration, detectedFPS });
            } 
            // @ts-ignore - Some browsers expose this non-standard property
            else if (videoElement.webkitDecodedFrameCount !== undefined && videoElement.duration) {
              // @ts-ignore
              const webkitFrames = videoElement.webkitDecodedFrameCount;
              detectedFPS = Math.round(webkitFrames / videoElement.duration);
              console.log('🎬 Webkit 속성으로 FPS 감지:', { webkitFrames, duration: videoElement.duration, detectedFPS });
            }
            
            // 중요: 속성 기반 감지가 실패하거나 0을 반환하면 항상 프레임 분석 방식 사용
            if (detectedFPS <= 0) {
              console.log('🎬 속성 기반 FPS 감지 실패 또는 0 반환, 프레임 분석 방식으로 전환');
              
              // Try to detect by seeking and counting frames
              const seekTest = async (): Promise<number> => {
                const testDuration = Math.min(5, videoElement.duration); // 최대 5초 또는 비디오 길이
                const startTime = 0;
                const endTime = testDuration;
                const seekStep = 1/60; // 60fps max detection
                
                let frameCount = 0;
                let lastImageData: ImageData | null = null;
                
                // Create a canvas to compare frames
                const canvas = document.createElement('canvas');
                canvas.width = 32; // Small size for performance
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) return 30; // Fallback if canvas not supported
                
                // Function to check if frame changed
                const isNewFrame = (): boolean => {
                  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  
                  if (!lastImageData) {
                    lastImageData = imageData;
                    return true;
                  }
                  
                  // Compare with previous frame
                  const data1 = lastImageData.data;
                  const data2 = imageData.data;
                  
                  // Check a sample of pixels
                  for (let i = 0; i < data1.length; i += 40) {
                    if (Math.abs(data1[i] - data2[i]) > 5) {
                      lastImageData = imageData;
                      return true;
                    }
                  }
                  
                  return false;
                };
                
                // Seek through video and count frames
                videoElement.currentTime = startTime;
                await new Promise(r => videoElement.addEventListener('seeked', r, { once: true }));
                
                for (let time = startTime; time <= endTime; time += seekStep) {
                  videoElement.currentTime = time;
                  await new Promise(r => videoElement.addEventListener('seeked', r, { once: true }));
                  
                  if (isNewFrame()) {
                    frameCount++;
                  }
                }
                
                // Reset video position
                videoElement.currentTime = 0;
                
                const calculatedFPS = Math.round(frameCount / testDuration);
                console.log('🎬 프레임 분석 결과:', { frameCount, testDuration, calculatedFPS });
                
                return calculatedFPS;
              };
              
              try {
                detectedFPS = await seekTest();
                // Validate result is reasonable
                if (detectedFPS < 10 || detectedFPS > 120) {
                  console.log('🎬 감지된 FPS가 비정상적임:', detectedFPS, '기본값 30으로 설정');
                  detectedFPS = 30; // Fallback to common value
                }
              } catch (e) {
                console.warn('🎬 FPS 감지 실패:', e);
                detectedFPS = 30;
              }
            }
          } catch (e) {
            console.warn('🎬 FPS 감지 중 오류 발생:', e);
            detectedFPS = 30; // 오류 발생 시 기본값
          }
          
          // Common FPS values for normalization
          const commonFPS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
          
          // Find closest common FPS
          let closestFPS = 30;
          let minDiff = Number.MAX_VALUE;
          
          for (const fps of commonFPS) {
            const diff = Math.abs(detectedFPS - fps);
            if (diff < minDiff) {
              minDiff = diff;
              closestFPS = fps;
            }
          }
          
          console.log('🎬 FPS 감지 최종 결과:', {
            rawDetectedFPS: detectedFPS,
            normalizedFPS: closestFPS,
            difference: minDiff,
            commonFPSValues: commonFPS
          });
          
          return closestFPS;
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