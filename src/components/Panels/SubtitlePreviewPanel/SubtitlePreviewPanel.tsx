import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useTimelineStore } from '../../../stores/timelineStore';
import { useSelectedTrackStore } from '../../../stores/selectedTrackStore';
import { SubtitlePreviewFooter } from './SubtitlePreviewFooter';
import { SubtitlePreviewList } from './SubtitlePreviewList';
import { SubtitlePreviewEmpty } from './SubtitlePreviewEmpty';
import { SubtitleBlock } from '../../../types/project';

export const SubtitlePreviewPanel: React.FC = () => {
  const { currentProject } = useProjectStore();
  const { currentTime } = useTimelineStore();
  const { selectedTrackId } = useSelectedTrackStore();
  
  const [trackSubtitles, setTrackSubtitles] = useState<SubtitleBlock[]>([]);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter subtitles by selected track
  useEffect(() => {
    if (!currentProject) {
      setTrackSubtitles([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get subtitles for the selected track, or all subtitles if no track is selected
      const filteredSubtitles = selectedTrackId
        ? currentProject.subtitles.filter(sub => sub.trackId === selectedTrackId)
        : currentProject.subtitles;
      
      // Sort by start time
      const sortedSubtitles = [...filteredSubtitles].sort((a, b) => a.startTime - b.startTime);
      
      setTrackSubtitles(sortedSubtitles);
    } catch (err) {
      console.error('Error filtering subtitles:', err);
      setError('Failed to load subtitles');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, selectedTrackId, currentProject?.subtitles]);
  
  // Update active subtitle based on current time
  useEffect(() => {
    const activeSubtitle = trackSubtitles.find(
      sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    
    setActiveSubtitleId(activeSubtitle?.id || null);
  }, [currentTime, trackSubtitles]);
  
  // Get selected track name (빈 상태 메시지용)
  const selectedTrackName = selectedTrackId 
    ? currentProject?.tracks.find(track => track.id === selectedTrackId)?.name || 'Unknown Track'
    : 'All Tracks';
  
  // "원문 복사" 버튼 핸들러
  const handleCopyOriginal = () => {
    if (!activeSubtitleId) return;
    const subtitle = trackSubtitles.find(sub => sub.id === activeSubtitleId);
    if (!subtitle) return;
    const originalText = subtitle.spans.map(span => span.text).join('');
    if (!originalText) return;

    // 클립보드에 복사
    navigator.clipboard.writeText(originalText).catch(console.error);
  };
  
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
      <SubtitlePreviewList 
        subtitles={trackSubtitles}
        styles={currentProject?.styles || []}
      />
    </div>
  );
};

export default SubtitlePreviewPanel;