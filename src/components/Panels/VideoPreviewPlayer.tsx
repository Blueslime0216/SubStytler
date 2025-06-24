import React from 'react';

interface VideoPreviewPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasVideo: boolean;
  videoUrl?: string;
}

const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({ videoRef, hasVideo, videoUrl }) => (
  <div 
    className="relative w-full h-full flex items-center justify-center video-container"
    style={{ 
      background: 'var(--neu-base)' // 검은색 대신 기본 배경색 사용
    }}
  >
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