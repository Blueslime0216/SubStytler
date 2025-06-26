import React from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';
import { SubtitleBlock as SubtitleBlockType } from '../../types/project';

interface SubtitleBlockProps {
  subtitle: SubtitleBlockType;
  timeToPixel: (time: number) => number;
  containerRef: React.RefObject<HTMLDivElement>;
  onDragStart: () => void;
  isLocked: boolean;
}

export const SubtitleBlock: React.FC<SubtitleBlockProps> = ({
  subtitle,
  timeToPixel,
  containerRef,
  onDragStart,
  isLocked
}) => {
  const dragStartMap = React.useRef<Record<string, number>>({});
  const { updateSubtitle } = useProjectStore();
  
  const left = timeToPixel(subtitle.startTime);
  const width = timeToPixel(subtitle.endTime) - left;
  
  if (!containerRef.current || left + width < 0 || (containerRef.current.clientWidth && left > containerRef.current.clientWidth)) {
    return null;
  }

  // duration of this subtitle block
  const subtitleDuration = subtitle.endTime - subtitle.startTime;

  const TRACK_HEIGHT = 50;

  return (
    <motion.div
      key={subtitle.id}
      className="neu-subtitle-block absolute cursor-move flex items-center px-4 neu-interactive"
      style={{
        left: Math.max(0, left),
        width: Math.max(32, width),
        top: '7px', // Will be positioned via parent
        transition: 'none',
        userSelect: 'none',
        opacity: isLocked ? 0.7 : 1
      }}
      drag={isLocked ? false : true}
      dragConstraints={containerRef}
      dragTransition={{ power: 0, timeConstant: 0 }}
      draggable={!isLocked}
      onDragStart={() => {
        if (isLocked) return;
        if (!containerRef.current) return;
        
        const origLeftPx = timeToPixel(subtitle.startTime);
        dragStartMap.current[subtitle.id] = origLeftPx;
        onDragStart();
      }}
      onDragEnd={(e, info) => {
        if (isLocked) return;
        
        const { viewStart, viewEnd, duration, snapToFrame } = useTimelineStore.getState();
        const { currentProject } = useProjectStore.getState();
        if (!containerRef.current || !currentProject) return;

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

        // Determine new track based on final Y position
        const containerRect = containerRef.current.getBoundingClientRect();

        // e is MouseEvent | TouchEvent | PointerEvent. We'll get clientY if available
        const clientY = 'clientY' in e ? (e as MouseEvent).clientY : (e as any).touches?.[0]?.clientY ?? 0;
        const offsetY = clientY - containerRect.top;
        const newTrackIndex = Math.floor(offsetY / TRACK_HEIGHT);
        const tracks = currentProject.tracks;
        const targetTrack = tracks[newTrackIndex];

        const updates: any = { startTime: newStart, endTime: newEnd };
        if (targetTrack && targetTrack.id !== subtitle.trackId && !targetTrack.locked) {
          updates.trackId = targetTrack.id;
        }

        updateSubtitle(subtitle.id, updates);
      }}
      title={`${subtitle.spans[0]?.text || 'Empty subtitle'} - Click and drag to move`}
      tabIndex={0}
    >
      <div className="text-sm text-white font-semibold truncate">
        {subtitle.spans[0]?.text || 'Empty subtitle'}
      </div>
    </motion.div>
  );
};

export default SubtitleBlock;