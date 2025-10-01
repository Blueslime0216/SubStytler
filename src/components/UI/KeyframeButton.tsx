import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';
import { useTimelineStore } from '../../stores/timelineStore';

interface KeyframeButtonProps {
  property: string; // e.g. 'fc' for font color
  getCurrentValue: () => any; // returns value to store in keyframe
  easingId?: string; // optional curve id
  variant?: 'diamond' | 'square'; // UI shape only
}

/** Keyframe add button (supports diamond or rounded-square) */
const KeyframeButton: React.FC<KeyframeButtonProps> = ({ property, getCurrentValue, easingId, variant = 'diamond' }) => {
  const replaceKeyframe = useProjectStore((s: any) => s.replaceKeyframe);
  const currentProject = useProjectStore((s) => s.currentProject);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const subtitleId = useSelectedSubtitleStore((s) => s.selectedSubtitleId);

  const handleClick = () => {
    if (!subtitleId || !replaceKeyframe) return;
    
    // 현재 자막 찾기
    const subtitle = currentProject?.subtitles.find(sub => sub.id === subtitleId);
    if (!subtitle) return;
    
    // 동일 위치 충돌 제거 + 추가를 단일 히스토리 단계로 처리
    replaceKeyframe(subtitleId, property, {
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
        transform: variant === 'diamond' ? 'rotate(45deg)' : undefined,
        borderRadius: variant === 'square' ? 4 : undefined,
        background: 'var(--color-primary, #00caff)',
        border: 'none',
        cursor: 'pointer',
        marginLeft: 4,
      }}
    />
  );
};

export default KeyframeButton; 