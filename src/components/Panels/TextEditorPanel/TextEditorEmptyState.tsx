import React from 'react';
import { Type } from 'lucide-react';

const TextEditorEmptyState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center text-text-secondary">
      <div className="text-center">
        <Type className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select a subtitle to edit</p>
      </div>
    </div>
  );
};

export default TextEditorEmptyState;