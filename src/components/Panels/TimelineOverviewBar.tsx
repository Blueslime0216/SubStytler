import React from 'react';

interface Props {
  duration: number;
  viewStart: number;
  viewEnd: number;
  sidebarOffset?: number; // pixels to offset from left (track header width)
}

const TimelineOverviewBar: React.FC<Props> = ({ duration, viewStart, viewEnd, sidebarOffset = 0 }) => {
  if (duration === 0) return null;

  const startPercent = (viewStart / duration) * 100;
  const endPercent = (viewEnd / duration) * 100;
  const widthPercent = endPercent - startPercent;

  return (
    <div
      className="relative h-3 mt-2 neu-card neu-shadow-inset overflow-hidden rounded"
      style={{ marginLeft: sidebarOffset, width: `calc(100% - ${sidebarOffset}px)` }}
    >
      {/* full bar background via neu-card */}
      <div
        className="absolute top-0 h-full neu-bg-accent opacity-30"
        style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
      />
    </div>
  );
};

export default TimelineOverviewBar; 