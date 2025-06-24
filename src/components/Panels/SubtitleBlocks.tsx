import React from 'react';
import { motion } from 'framer-motion';

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
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
}

export const SubtitleBlocks: React.FC<SubtitleBlocksProps> = ({
  subtitles,
  currentTime,
  timeToPixel,
  containerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}) => (
  <div
    ref={containerRef}
    className="h-full relative cursor-pointer neu-interactive"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    title="Click to seek, drag to scrub"
  >
    {/* Subtitles */}
    {subtitles.map((subtitle) => {
      const left = timeToPixel(subtitle.startTime);
      const width = timeToPixel(subtitle.endTime) - left;
      if (left + width < 0 || left > (containerRef.current?.clientWidth || 0)) {
        return null;
      }
      return (
        <motion.div
          key={subtitle.id}
          className="neu-subtitle-block absolute h-10 cursor-move flex items-center px-4 neu-interactive"
          style={{
            left: Math.max(0, left),
            width: Math.max(32, width),
            top: 60,
            transition: 'none',
          }}
          drag="x"
          dragConstraints={{
            left: -left,
            right: (containerRef.current?.clientWidth || 0) - left - width,
          }}
          dragTransition={{ power: 0, timeConstant: 0 }}
          title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Click and drag to move`}
          tabIndex={0}
        >
          <div className="text-sm text-white font-semibold truncate">
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

export default SubtitleBlocks; 