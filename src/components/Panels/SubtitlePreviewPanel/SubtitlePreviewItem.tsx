import React, { forwardRef } from 'react';
import { SubtitleBlock } from '../../../types/project';
import { formatTime } from '../../../utils/timeUtils';
import { useTimelineStore } from '../../../stores/timelineStore';

interface SubtitlePreviewItemProps {
  subtitle: SubtitleBlock;
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export const SubtitlePreviewItem = forwardRef<HTMLDivElement, SubtitlePreviewItemProps>(({
  subtitle,
  isActive,
  isPast,
  isFuture
}, ref) => {
  const { setCurrentTime } = useTimelineStore();
  
  // Get the first span for display
  const span = subtitle.spans[0] || { text: '' };
  const text = span.text || 'Empty subtitle';
  
  // Get style properties
  const isBold = span.isBold || false;
  const isItalic = span.isItalic || false;
  const isUnderline = span.isUnderline || false;
  
  // Format times
  const startTimeFormatted = formatTime(subtitle.startTime);
  const endTimeFormatted = formatTime(subtitle.endTime);
  const duration = Math.round((subtitle.endTime - subtitle.startTime) / 1000);
  
  // Handle click to seek to this subtitle
  const handleClick = () => {
    setCurrentTime(subtitle.startTime);
  };
  
  return (
    <div
      ref={ref}
      className={`
        p-3 rounded-lg transition-all duration-200 cursor-pointer
        ${isActive ? 'bg-primary-color/20 shadow-outset' : 'bg-surface shadow-outset-subtle'}
        ${isPast ? 'opacity-70' : ''}
        ${isFuture ? '' : ''}
      `}
      onClick={handleClick}
    >
      {/* Timing information */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono bg-bg px-2 py-0.5 rounded shadow-inset-subtle text-text-secondary">
            {startTimeFormatted}
          </span>
          <span className="text-text-muted">→</span>
          <span className="font-mono bg-bg px-2 py-0.5 rounded shadow-inset-subtle text-text-secondary">
            {endTimeFormatted}
          </span>
        </div>
        <span className="text-text-muted">
          {duration}s
        </span>
      </div>
      
      {/* Subtitle text */}
      <div 
        className={`
          text-sm text-text-primary p-2 bg-bg rounded shadow-inset-subtle
          ${isActive ? 'border border-primary-color/50' : ''}
        `}
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none'
        }}
      >
        {text}
      </div>
      
      {/* Future implementation: style preview */}
      {/* 
      <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
        <div className="w-2 h-2 rounded-full bg-primary-color"></div>
        <span>Default Style</span>
      </div>
      */}
    </div>
  );
});

SubtitlePreviewItem.displayName = 'SubtitlePreviewItem';