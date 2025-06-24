import React from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasVideo: boolean;
  videoUrl?: string;
}

const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ videoRef, hasVideo, videoUrl }) => (
  <div className="relative w-full h-full flex items-center justify-center bg-black video-container">
    <video
      ref={videoRef}
      className={`w-full h-full object-contain z-10 ${hasVideo ? 'block video-loaded' : 'hidden'}`}
      playsInline
      controls={false}
      preload="metadata"
      src={hasVideo ? videoUrl : undefined}
    />
  </div>
);

export default VideoPreviewPlayer; 