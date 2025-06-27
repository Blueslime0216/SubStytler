import React from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';

interface SubtitleBlock {
  id: string;
  spans: { id: string; text: string; startTime: number; endTime: number }[];
  startTime: number;
  endTime: number;
  trackId: string;
}

interface SubtitleBlocksProps {
  subtitles: SubtitleBlock[];
  currentTime: number;
  timeToPixel: (time: number) => number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const SubtitleBlocks: React.FC<SubtitleBlocksProps> = ({
  subtitles,
  currentTime,
  timeToPixel,
  containerRef,
}) => {
  const dragStartMap = React.useRef<Record<string, number>>({});

  return (
    <div ref={containerRef} className="h-full relative">
      {/* Subtitles */}
      {subtitles.map((subtitle) => {
        const left = timeToPixel(subtitle.startTime);
        const width = timeToPixel(subtitle.endTime) - left;
        if (!containerRef.current || left + width < 0 || left > containerRef.current.clientWidth) {
          return null;
        }

        // duration of this subtitle block
        const subtitleDuration = subtitle.endTime - subtitle.startTime;

        return (
          <motion.div
            key={subtitle.id}
            className="neu-subtitle-block absolute cursor-move"
            style={{
              left: Math.max(0, left),
              width: Math.max(32, width),
              top: 20,
              userSelect: 'none',
              transition: 'none',
            }}
            drag="x"
            dragConstraints={containerRef}
            dragTransition={{ power: 0, timeConstant: 0 }}
            draggable={false}
            onDragStart={() => {
              if(!containerRef.current) return;
              const origLeftPx = timeToPixel(subtitle.startTime);
              dragStartMap.current[subtitle.id] = origLeftPx;
            }}
            onDragEnd={(e, info) => {
              const { viewStart, viewEnd, duration, snapToFrame } = useTimelineStore.getState();
              const { updateSubtitle } = useProjectStore.getState();
              if (!containerRef.current) return;

              const containerWidth = containerRef.current.clientWidth;
              const viewDuration = viewEnd - viewStart;

              const origLeftPx = dragStartMap.current[subtitle.id] ?? timeToPixel(subtitle.startTime);

              const newLeftPx = origLeftPx + info.offset.x;
              let newStart = viewStart + (newLeftPx / containerWidth) * viewDuration;

              // clamp within valid range
              newStart = Math.max(0, Math.min(duration - subtitleDuration, newStart));

              // optional snap to frame
              newStart = snapToFrame(newStart);

              const newEnd = newStart + subtitleDuration;
              updateSubtitle(subtitle.id, { startTime: newStart, endTime: newEnd });
            }}
            title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Click and drag to move`}
            tabIndex={0}
          >
            <div className="subtitle-block-text">
              {subtitle.spans[0]?.text || 'Empty subtitle'}
            </div>
          </motion.div>
        );
      })}
      {/* Enhanced Playhead */}
      <motion.div
        className="absolute top-0 w-1 h-full pointer-events-none z-20 neu-playhead"
        style={{
          left: timeToPixel(currentTime),
          background: 'var(--neu-primary)',
          transition: 'none',
        }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className="absolute -top-3 -left-3 w-6 h-6 rotate-45 neu-shadow-1"
          style={{
            background: 'var(--neu-primary)',
            transition: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};

export default SubtitleBlocks; 