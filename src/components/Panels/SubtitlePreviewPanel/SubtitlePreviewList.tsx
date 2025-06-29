import React from 'react';
import { SubtitleBlock } from '../../../types/project';

interface SubtitlePreviewListProps {
  subtitles: SubtitleBlock[];
  activeSubtitleId: string | null;
  currentTime: number;
}

export const SubtitlePreviewList: React.FC<SubtitlePreviewListProps> = ({
  subtitles
}) => {
  return (
    <pre className="flex-1 overflow-y-auto p-4 bg-bg font-mono text-xs rounded border border-border-color whitespace-pre-wrap">
      {subtitles.map(sub => {
        const style = sub.spans[0]?.styleId || 'default';
        const text = sub.spans.map(span => span.text).join('');
        return `start: ${sub.startTime}, end: ${sub.endTime}, style: ${style}\n${text}\n\n`;
      }).join('')}
    </pre>
  );
};