import React from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasVideo: boolean;
  videoUrl?: string;
}

const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ videoRef, hasVideo, videoUrl }) => (
  <video
    ref={videoRef}
    className={`w-full h-full object-contain ${hasVideo ? 'block' : 'hidden'}`}
    playsInline
    controls={false}
    preload="metadata"
    src={hasVideo ? videoUrl : undefined}
  />
);

export default VideoPreviewPlayer; 