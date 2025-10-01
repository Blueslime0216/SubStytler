import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { SubtitlePreviewList } from './SubtitlePreviewList';
import { SubtitlePreviewEmpty } from './SubtitlePreviewEmpty';
import { SubtitleBlock } from '../../../types/project';
import { expandProjectForAnimations } from '../../../utils/animationExpander';
import { generateYTTContent } from '../../../utils/yttGenerator';
import { useTimelineStore } from '../../../stores/timelineStore';

export const SubtitlePreviewPanel: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { fps } = useTimelineStore();
  
  const [trackSubtitles, setTrackSubtitles] = useState<SubtitleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yttContent, setYttContent] = useState('');
  
  // 모든 트랙의 자막을 시간순으로 정렬하여 표시
  useEffect(() => {
    if (!currentProject) {
      setTrackSubtitles([]);
      setYttContent('');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 시간순 정렬 (트랙 구분 없이 전부)
      const sortedSubtitles = [...currentProject.subtitles].sort((a, b) => a.startTime - b.startTime);
      
      setTrackSubtitles(sortedSubtitles);

      // 애니메이션 확장 → YTT 문자열 생성 (with duration optimization)
      const expanded = expandProjectForAnimations(currentProject, fps);
      
      // Debug: Show optimization results
      const originalCount = currentProject.subtitles.length;
      const expandedCount = expanded.subtitles.length;
      const hasAnimations = currentProject.subtitles.some(sub => 
        sub.spans.some(span => span.animations && span.animations.length > 0)
      );
      
      if (hasAnimations) {
        console.log(`🎯 Duration Optimization Results:`);
        console.log(`  Original subtitles: ${originalCount}`);
        console.log(`  Expanded subtitles: ${expandedCount}`);
        console.log(`  Optimization ratio: ${(expandedCount / originalCount).toFixed(2)}x`);
      }
      
      const ytt = generateYTTContent(expanded);
      setYttContent(ytt);
    } catch (err) {
      console.error('Error filtering subtitles:', err);
      setError('Failed to load subtitles');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, currentProject?.subtitles, fps]);
  
  // 패널이 항상 모든 자막을 보이므로 트랙 이름 대신 고정 메시지 사용
  const selectedTrackName = 'All Tracks';
  
  // Handle empty state
  if (trackSubtitles.length === 0) {
    return (
      <SubtitlePreviewEmpty 
        isLoading={isLoading}
        error={error}
        trackName={selectedTrackName}
      />
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-surface min-h-0">
      <SubtitlePreviewList yttContent={yttContent} />
    </div>
  );
};

export default SubtitlePreviewPanel;