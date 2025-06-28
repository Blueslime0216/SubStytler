/**
 * Video utility functions for capturing thumbnails and handling video metadata
 */

export interface VideoThumbnail {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

export interface VideoInfo {
  title: string;
  filename: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  size: number;
  type: string;
  lastModified: number;
  thumbnail?: VideoThumbnail;
}

/**
 * Captures a thumbnail from a video element at the current time
 */
export const captureVideoThumbnail = (
  videoElement: HTMLVideoElement,
  maxWidth: number = 320,
  quality: number = 0.7
): Promise<VideoThumbnail> => {
  return new Promise((resolve, reject) => {
    try {
      if (!videoElement || videoElement.readyState < 2) {
        reject(new Error('Video not ready for thumbnail capture'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate dimensions maintaining aspect ratio
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      const aspectRatio = videoWidth / videoHeight;
      
      let thumbnailWidth = maxWidth;
      let thumbnailHeight = maxWidth / aspectRatio;
      
      if (thumbnailHeight > maxWidth) {
        thumbnailHeight = maxWidth;
        thumbnailWidth = maxWidth * aspectRatio;
      }

      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      // Draw the current frame
      ctx.drawImage(videoElement, 0, 0, thumbnailWidth, thumbnailHeight);

      // Convert to data URL with compression
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      resolve({
        dataUrl,
        width: thumbnailWidth,
        height: thumbnailHeight,
        timestamp: videoElement.currentTime * 1000 // Convert to milliseconds
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Extracts comprehensive video information including thumbnail
 */
export const extractVideoInfo = async (
  file: File,
  videoElement?: HTMLVideoElement
): Promise<VideoInfo> => {
  const baseInfo: VideoInfo = {
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
    filename: file.name,
    duration: 0,
    width: 0,
    height: 0,
    fps: 30, // Default, will be updated if video element is available
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };

  // If video element is provided and ready, extract additional info
  if (videoElement && videoElement.readyState >= 2) {
    baseInfo.duration = videoElement.duration * 1000; // Convert to milliseconds
    baseInfo.width = videoElement.videoWidth;
    baseInfo.height = videoElement.videoHeight;

    try {
      // Capture thumbnail at current time
      const thumbnail = await captureVideoThumbnail(videoElement);
      baseInfo.thumbnail = thumbnail;
    } catch (error) {
      console.warn('Failed to capture video thumbnail:', error);
    }
  }

  return baseInfo;
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats duration in human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Validates video file type
 */
export const isValidVideoFile = (file: File): boolean => {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/m4v'
  ];
  
  return validTypes.includes(file.type) || 
         validTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]));
};