import React from 'react';
import { VideoController } from '../Video/VideoController';

interface VideoPreviewControllerProps {
  isVideoLoaded: boolean;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  onSettings: () => void;
  parentRef?: React.RefObject<HTMLElement>;
}

const VideoPreviewController: React.FC<VideoPreviewControllerProps> = (props) => (
  <VideoController
    isVideoLoaded={props.isVideoLoaded}
    volume={props.volume}
    isMuted={props.isMuted}
    onVolumeChange={props.onVolumeChange}
    onMuteToggle={props.onMuteToggle}
    onSettings={props.onSettings}
    parentRef={props.parentRef}
  />
);

export default VideoPreviewController; 