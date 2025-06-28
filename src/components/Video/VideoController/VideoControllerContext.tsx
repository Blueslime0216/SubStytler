import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTimelineStore } from '../../../stores/timelineStore';

interface VideoControllerContextType {
  isInteracting: boolean;
  isPinned: boolean;
  isVideoLoaded: boolean;
  volume: number;
  isMuted: boolean;
  handleInteractionStart: () => void;
  handleInteractionEnd: () => void;
  togglePin: () => void;
  handlePlayPause: () => void;
  handleSkipForward: () => void;
  handleVolumeChange: (newVolume: number) => void;
  handleMuteToggle: () => void;
  handleSettings: () => void;
}

const VideoControllerContext = createContext<VideoControllerContextType | null>(null);

export const useVideoController = () => {
  const context = useContext(VideoControllerContext);
  if (!context) {
    throw new Error('useVideoController must be used within a VideoControllerProvider');
  }
  return context;
};

interface VideoControllerProviderProps {
  children: React.ReactNode;
  isVideoLoaded: boolean;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onSettings: () => void;
}

export const VideoControllerProvider: React.FC<VideoControllerProviderProps> = ({
  children,
  isVideoLoaded,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  onSettings
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  
  const { 
    isPlaying, 
    duration,
    setPlaying, 
    setCurrentTime 
  } = useTimelineStore();

  const handleInteractionStart = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned(prev => !prev);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!isVideoLoaded) return;
    setPlaying(!isPlaying);
  }, [isVideoLoaded, isPlaying, setPlaying]);

  const handleSkipForward = useCallback(() => {
    if (!isVideoLoaded) return;
    setCurrentTime(Math.min(duration, setCurrentTime.length > 0 ? setCurrentTime[0] + 5000 : 5000));
  }, [isVideoLoaded, duration, setCurrentTime]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  const handleMuteToggle = useCallback(() => {
    onMuteToggle();
  }, [onMuteToggle]);

  const handleSettings = useCallback(() => {
    onSettings();
  }, [onSettings]);

  const value = {
    isInteracting,
    isPinned,
    isVideoLoaded,
    volume,
    isMuted,
    handleInteractionStart,
    handleInteractionEnd,
    togglePin,
    handlePlayPause,
    handleSkipForward,
    handleVolumeChange,
    handleMuteToggle,
    handleSettings
  };

  return (
    <VideoControllerContext.Provider value={value}>
      {children}
    </VideoControllerContext.Provider>
  );
};