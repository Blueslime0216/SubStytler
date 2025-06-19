import React from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';

interface TimelineTrackAreaProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const TimelineTrackArea: React.FC<TimelineTrackAreaProps> = ({
  containerRef,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp
}) => {
  const { currentTime, viewStart, viewEnd, fps } = useTimelineStore();
  const { currentProject } = useProjectStore();

  const timeToPixel = (time: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const viewDuration = viewEnd - viewStart;
    return ((time - viewStart) / viewDuration) * containerWidth;
  };

  const renderFrameGrid = () => {
    const lines = [];
    const frameDuration = 1000 / fps;
    const startFrame = Math.floor(viewStart / frameDuration);
    const endFrame = Math.ceil(viewEnd / frameDuration);
    
    for (let frame = startFrame; frame <= endFrame; frame++) {
      const time = frame * frameDuration;
      const x = timeToPixel(time);
      
      if (x < 0 || x > (containerRef.current?.clientWidth || 0)) continue;
      
      lines.push(
        <div
          key={frame}
          className="absolute w-px h-full opacity-20"
          style={{ 
            left: x,
            backgroundColor: 'var(--border-primary)',
            transition: 'none'
          }}
        />
      );
    }
    
    return lines;
  };

  const handleSubtitleDrag = (subtitleId: string, newStartTime: number) => {
    console.log('Update subtitle timing:', subtitleId, newStartTime);
  };

  return (
    <div className="timeline-track flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        className="h-full relative cursor-pointer"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {renderFrameGrid()}
        
        {currentProject?.subtitles.map((subtitle) => {
          const left = timeToPixel(subtitle.startTime);
          const width = timeToPixel(subtitle.endTime) - left;
          
          if (left + width < 0 || left > (containerRef.current?.clientWidth || 0)) {
            return null;
          }
          
          return (
            <motion.div
              key={subtitle.id}
              className="subtitle-block absolute h-8 cursor-move flex items-center px-3"
              style={{
                left: Math.max(0, left),
                width: Math.max(20, width),
                top: 50,
                transition: 'none'
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              drag="x"
              dragConstraints={{ 
                left: -left, 
                right: (containerRef.current?.clientWidth || 0) - left - width 
              }}
              onDrag={(event, info) => {
                const newLeft = left + info.offset.x;
                const pixelToTime = (pixel: number) => {
                  if (!containerRef.current) return 0;
                  const containerWidth = containerRef.current.clientWidth;
                  const viewDuration = viewEnd - viewStart;
                  return viewStart + (pixel / containerWidth) * viewDuration;
                };
                const newTime = pixelToTime(newLeft);
                handleSubtitleDrag(subtitle.id, newTime);
              }}
              dragTransition={{ power: 0, timeConstant: 0 }}
            >
              <div className="text-xs text-white font-medium truncate">
                {subtitle.spans[0]?.text || 'Empty subtitle'}
              </div>
            </motion.div>
          );
        })}
        
        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full pointer-events-none z-20"
          style={{ 
            left: timeToPixel(currentTime),
            backgroundColor: 'var(--accent-primary)',
            transition: 'none'
          }}
        >
          <div 
            className="absolute -top-2 -left-2 w-4 h-4 rotate-45"
            style={{
              backgroundColor: 'var(--accent-primary)',
              transition: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};