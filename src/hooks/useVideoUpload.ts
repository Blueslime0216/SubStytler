import { useCallback, useState, useEffect } from 'react';
import * as MP4Box from 'mp4box';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useToast } from './useToast';

interface VideoUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;
}

// Helper function to get video metadata using mp4box.js
const getVideoMetadata = (
  file: File
): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
}> => {
  return new Promise((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile();

    mp4boxfile.onReady = (info: any) => {
      const videoTrack = info.tracks.find((track: any) => track.type === 'video');
      if (videoTrack) {
        const fps = videoTrack.nb_samples / (videoTrack.duration / videoTrack.timescale);
        resolve({
          duration: info.duration / info.timescale,
          width: videoTrack.video.width,
          height: videoTrack.video.height,
          fps: Math.round(fps * 100) / 100, // Round to 2 decimal places
        });
      } else {
        reject(new Error('No video track found in the file.'));
      }
    };

    mp4boxfile.onError = (e: any) => {
      reject(new Error(`mp4box failed to parse file: ${e}`));
    };

    const reader = new FileReader();
    reader.onload = e => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      (arrayBuffer as any).fileStart = 0;
      mp4boxfile.appendBuffer(arrayBuffer as MP4Box.MP4BoxBuffer);
      mp4boxfile.flush();
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    reader.readAsArrayBuffer(file);
  });
};

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
        uploadStage: 'Loading video metadata...'
      }));

      // Stage 3: Load video metadata using mp4box
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not available');
      }

      const metadata = await getVideoMetadata(file);
      console.log('🎬 Extracted metadata:', metadata);

      // Ask for confirmation for unusual FPS values
      const commonFpsValues = [23.97, 24, 25, 29.97, 30, 50, 59.94, 60];
      const isUnusualFps = !commonFpsValues.some(fps => Math.abs(fps - metadata.fps) < 0.1);

      if (isUnusualFps && (metadata.fps < 10 || metadata.fps > 120)) {
        setDetectedFps(metadata.fps);
        setPendingVideoData({ file, metadata, url });
        setShowFpsConfirmation(true);
        // Pause processing until user confirms
        setUploadState(prev => ({
          ...prev,
          isUploading: false
        }));
        return;
      }

      // If FPS is standard, or we don't want to confirm, proceed directly
      await finalizeVideoLoad({ file, metadata, url });
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
  }, [videoRef, warning, error]);

  const finalizeVideoLoad = useCallback(
    async ({ file, metadata, url }: { file: File; metadata: any; url: string }) => {
      setUploadState({
        isUploading: true,
        uploadProgress: 80,
        uploadStage: 'Applying metadata...'
      });

      const video = videoRef.current;
      if (!video) {
        error({ title: 'Error', message: 'Video element disappeared.' });
        return;
      }

      // Set video source
      video.src = url;

      // Apply metadata to stores
      setVideoMeta({
        filename: file.name,
        duration: metadata.duration * 1000,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        file: file
      });
      setDuration(metadata.duration * 1000);
      setFPS(metadata.fps);
      setCurrentTime(0);

      setUploadState({
        isUploading: true,
        uploadProgress: 100,
        uploadStage: 'Upload complete!'
      });

      success({
        title: 'Video loaded successfully!',
        message: `${file.name} (${metadata.width}x${metadata.height} @ ${metadata.fps.toFixed(2)}fps)`
      });
    },
    [videoRef, setVideoMeta, setDuration, setFPS, setCurrentTime, success, error]
  );

  const handleConfirmLargeFile = () => {
    if (pendingLargeFile) {
      continueVideoProcessing(pendingLargeFile);
    }
    setShowSizeWarning(false);
    setPendingLargeFile(null);
  };

  const handleFpsConfirm = (newFps: number) => {
    if (pendingVideoData) {
      const { file, metadata, url } = pendingVideoData;
      const updatedMetadata = { ...metadata, fps: newFps };
      finalizeVideoLoad({ file, metadata: updatedMetadata, url });
    }
    setShowFpsConfirmation(false);
    setPendingVideoData(null);
  };

  const handleFpsCancel = () => {
    if (pendingVideoData && pendingVideoData.url) {
      URL.revokeObjectURL(pendingVideoData.url);
    }
    setShowFpsConfirmation(false);
    setPendingVideoData(null);
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      uploadStage: ''
    });
    info({
      title: 'Video Upload Canceled',
      message: 'You can select a different file to upload.'
    });
  };

  return {
    uploadState,
    processVideoFile,
    showSizeWarning,
    pendingLargeFile,
    handleConfirmLargeFile,
    showFpsConfirmation,
    detectedFps,
    handleFpsConfirm,
    handleFpsCancel
  };
};