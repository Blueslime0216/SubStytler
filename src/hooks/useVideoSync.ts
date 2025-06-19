import { useEffect, useRef } from 'react';
import { useTimelineStore } from '../stores/timelineStore';

export const useVideoSync = (videoRef: React.RefObject<HTMLVideoElement>, isVideoLoaded: boolean) => {
  const { currentTime, isPlaying, setCurrentTime, setPlaying } = useTimelineStore();
  const lastSyncTime = useRef<number>(0);
  const syncThreshold = 200; // milliseconds

  // Sync timeline time to video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    const targetTime = currentTime / 1000;
    const currentVideoTime = video.currentTime;
    
    // Only seek if there's a significant difference to avoid constant seeking
    if (Math.abs(targetTime - currentVideoTime) > syncThreshold / 1000) {
      video.currentTime = targetTime;
      lastSyncTime.current = Date.now();
    }
  }, [currentTime, isVideoLoaded, videoRef]);

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    const syncPlayState = async () => {
      try {
        if (isPlaying && video.paused) {
          await video.play();
        } else if (!isPlaying && !video.paused) {
          video.pause();
        }
      } catch (error) {
        console.error('Video play/pause error:', error);
        setPlaying(false);
      }
    };

    syncPlayState();
  }, [isPlaying, isVideoLoaded, setPlaying, videoRef]);

  // Listen to video time updates and sync back to timeline
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Only update timeline if we're playing and it's been a while since manual sync
      if (isPlaying && Date.now() - lastSyncTime.current > syncThreshold) {
        const newTime = video.currentTime * 1000;
        // Only update if there's a significant difference to avoid loops
        if (Math.abs(newTime - currentTime) > 100) {
          setCurrentTime(newTime);
        }
      }
    };

    const handleLoadedMetadata = () => {
      // Video metadata loaded
    };

    const handleCanPlay = () => {
      // Video can start playing
    };

    const handleWaiting = () => {
      // Video is buffering
    };

    const handleError = (e: Event) => {
      console.error('Video playback error:', e);
      setPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
    };
  }, [setCurrentTime, isPlaying, currentTime, setPlaying, videoRef]);
};