import React from 'react';
import { Menu } from 'lucide-react';

export const MoreOptionsButton: React.FC = () => {
  return (
    <button className="btn-icon w-7 h-7 flex items-center justify-center ml-1">
      <Menu size={14} />
    </button>
  );
};