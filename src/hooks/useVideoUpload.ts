import { useCallback, useState } from 'react';
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

  const { setVideoMeta, currentProject } = useProjectStore();
  const { setDuration, setFPS, setCurrentTime } = useTimelineStore();
  const { success, error, info, warning } = useToast();

  const processVideoFile = useCallback(async (file: File) => {
    // File size validation with detailed warning
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      const fileSizeMB = Math.round(file.size / (1024 * 1024));
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      
      error({
        title: 'File Too Large',
        message: `The selected video file is ${fileSizeMB}MB, which exceeds the maximum allowed size of ${maxSizeMB}MB. Please use a smaller video file or compress your video before uploading.`,
        duration: 8000 // Longer duration for important message
      });
      return;
    }

    // Warning for files approaching the limit (over 400MB)
    const warningThreshold = 400 * 1024 * 1024; // 400MB
    if (file.size > warningThreshold) {
      const fileSizeMB = Math.round(file.size / (1024 * 1024));
      warning({
        title: 'Large File Warning',
        message: `This ${fileSizeMB}MB video file is quite large and may take longer to process. For better performance, consider using a smaller file.`,
        duration: 6000
      });
    }

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

      console.log('Setting video URL:', url);
      
      // Set up video loading promise
      const videoLoadPromise = new Promise<{
        duration: number;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('Video loading timed out after 30 seconds');
          reject(new Error('Video loading timed out after 30 seconds'));
        }, 30000);

        const handleLoadedMetadata = () => {
          cleanup();
          
          console.log('Video metadata loaded successfully:', {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          });
          
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

          resolve({
            duration: duration * 1000, // Convert to milliseconds
            width,
            height
          });
        };

        const handleError = (e: Event) => {
          cleanup();
          console.error('Video loading error:', e);
          reject(new Error('Failed to load video. The file may be corrupted or in an unsupported format.'));
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

      // Stage 4: Update stores with metadata
      const detectedFPS = 30; // Default FPS - could be enhanced with better detection
      
      setVideoMeta({
        filename: file.name,
        duration: metadata.duration,
        fps: detectedFPS,
        width: metadata.width,
        height: metadata.height,
        file
      });

      setDuration(metadata.duration);
      setFPS(detectedFPS);
      setCurrentTime(0); // Reset to beginning

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 100,
        uploadStage: 'Complete!'
      }));

      // Show success toast with file info
      const fileSizeMB = Math.round(file.size / (1024 * 1024));
      success({
        title: 'Video loaded successfully!',
        message: `${file.name} (${Math.round(metadata.duration / 1000)}s, ${metadata.width}×${metadata.height}, ${fileSizeMB}MB)`
      });

      // Reset upload state after a brief delay
      setTimeout(() => {
        setUploadState({
          isUploading: false,
          uploadProgress: 0,
          uploadStage: ''
        });
      }, 1500);

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
  }, [setVideoMeta, setDuration, setFPS, setCurrentTime, success, error, warning, videoRef]);

  return {
    uploadState,
    processVideoFile
  };
};