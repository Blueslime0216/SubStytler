import React from 'react';

export const FormatInfo: React.FC = () => {
  return (
    <div className="bg-base-color rounded-lg p-4 shadow-inset-subtle">
      <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
        Supported Formats
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {['MP4', 'WebM', 'MOV', 'AVI', 'MKV'].map((format) => (
          <span 
            key={format}
            className="px-2 py-1 bg-surface text-text-muted text-xs font-mono rounded shadow-outset-subtle"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  );
};