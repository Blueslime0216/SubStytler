import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
import { useTimelineStore } from '../../stores/timelineStore';

interface KeyframeButtonProps {
  property: string; // e.g. 'fc' for font color
  getCurrentValue: () => any; // returns value to store in keyframe
  easingId?: string; // optional curve id
}

/** Diamond-shaped keyframe add button */
const KeyframeButton: React.FC<KeyframeButtonProps> = ({ property, getCurrentValue, easingId }) => {
  const addKeyframe = useProjectStore((s: any) => s.addKeyframe);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const subtitleId = useSelectedSubtitleStore((s) => s.selectedSubtitleId);

  const handleClick = () => {
    if (!subtitleId || !addKeyframe) return;
    addKeyframe(subtitleId, property, {
      time: currentTime,
      value: getCurrentValue(),
      easingId,
    });
  };

  return (
    <button
      title="Add keyframe"
      onClick={handleClick}
      style={{
        width: 16,
        height: 16,
        transform: 'rotate(45deg)',
        background: 'var(--color-primary, #00caff)',
        border: 'none',
        cursor: 'pointer',
        marginLeft: 4,
      }}
    />
  );
};

export default KeyframeButton; 