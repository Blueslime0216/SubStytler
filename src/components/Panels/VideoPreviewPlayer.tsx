import React from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasVideo: boolean;
  videoUrl?: string;
}

const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ videoRef, hasVideo, videoUrl }) => (
  <video
    ref={videoRef}
    className={`video-player-element ${hasVideo ? 'video-loaded' : 'hidden'}`}
    playsInline
    controls={false}
    preload="metadata"
    src={hasVideo ? videoUrl : undefined}
    style={{
      maxWidth: '100%',
      maxHeight: '100%',
      display: hasVideo ? 'block' : 'none',
      transition: 'box-shadow 0.2s, background 0.2s'
    }}
  />
);

export default VideoPreviewPlayer;