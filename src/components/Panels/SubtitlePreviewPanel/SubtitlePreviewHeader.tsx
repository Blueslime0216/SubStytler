import React from 'react';
import { FileText, Clock } from 'lucide-react';

interface SubtitlePreviewHeaderProps {
  trackName: string;
  subtitleCount: number;
}

export const SubtitlePreviewHeader: React.FC<SubtitlePreviewHeaderProps> = ({
  trackName,
  subtitleCount
}) => {
  return (
    <div className="p-4 border-b border-border-color bg-surface shadow-outset-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-color flex items-center justify-center shadow-outset-subtle">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{trackName}</h3>
            <p className="text-xs text-text-secondary">
              {subtitleCount} {subtitleCount === 1 ? 'subtitle' : 'subtitles'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-text-secondary bg-bg px-2 py-1 rounded shadow-inset-subtle">
            <Clock className="w-3 h-3" />
            <span>Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};