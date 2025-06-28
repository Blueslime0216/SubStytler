import React from 'react';

export const FileSizeInfo: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg p-4 shadow-inset-subtle mb-4">
      <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
        Recommended File Size
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="px-3 py-1 bg-success-color/20 text-success-color text-xs font-semibold rounded shadow-inset">
          Less than 500MB
        </span>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Larger files may impact performance
      </p>
    </div>
  );
};