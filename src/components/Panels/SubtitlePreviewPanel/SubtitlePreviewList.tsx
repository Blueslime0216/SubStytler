import React, { useRef, useEffect } from 'react';
import { SubtitleBlock } from '../../../types/project';
import { SubtitlePreviewItem } from './SubtitlePreviewItem';
import { formatTime } from '../../../utils/timeUtils';

interface SubtitlePreviewListProps {
  subtitles: SubtitleBlock[];
  activeSubtitleId: string | null;
  currentTime: number;
}

export const SubtitlePreviewList: React.FC<SubtitlePreviewListProps> = ({
  subtitles,
  activeSubtitleId,
  currentTime
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to active subtitle
  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      // Calculate if the active item is in view
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = activeItemRef.current.getBoundingClientRect();
      
      const isInView = (
        itemRect.top >= listRect.top &&
        itemRect.bottom <= listRect.bottom
      );
      
      // If not in view, scroll to it with smooth behavior
      if (!isInView) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [activeSubtitleId]);
  
  return (
    <div 
      ref={listRef}
      className="flex-1 overflow-y-auto p-2 space-y-2 bg-bg shadow-inset-subtle"
    >
      {subtitles.map((subtitle) => {
        const isActive = subtitle.id === activeSubtitleId;
        const isPast = subtitle.endTime < currentTime;
        const isFuture = subtitle.startTime > currentTime;
        
        return (
          <SubtitlePreviewItem
            key={subtitle.id}
            subtitle={subtitle}
            isActive={isActive}
            isPast={isPast}
            isFuture={isFuture}
            ref={isActive ? activeItemRef : undefined}
          />
        );
      })}
    </div>
  );
};