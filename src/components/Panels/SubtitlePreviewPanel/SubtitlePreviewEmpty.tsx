import React from 'react';
import { FileText, AlertCircle, Loader } from 'lucide-react';

interface SubtitlePreviewEmptyProps {
  isLoading: boolean;
  error: string | null;
  trackName: string;
}

export const SubtitlePreviewEmpty: React.FC<SubtitlePreviewEmptyProps> = ({
  isLoading,
  error,
  trackName
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-text-secondary">
        <Loader className="w-10 h-10 mb-4 animate-spin opacity-50" />
        <p className="text-sm">Loading subtitles...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-error-color">
        <AlertCircle className="w-10 h-10 mb-4 opacity-70" />
        <p className="text-sm font-medium">{error}</p>
        <p className="text-xs mt-2 text-text-secondary">Please try again or check the console for details</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-text-secondary">
      <FileText className="w-10 h-10 mb-4 opacity-50" />
      <p className="text-sm font-medium">No subtitles found</p>
      <p className="text-xs mt-2 text-text-muted">
        {trackName === 'All Tracks' 
          ? 'Add subtitles to see them here'
          : `No subtitles in "${trackName}"`
        }
      </p>
    </div>
  );
};