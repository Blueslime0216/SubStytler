import React from 'react';
import { Undo, Redo } from 'lucide-react';
import { useHistoryStore } from '../../../stores/historyStore';

export const HistoryControls: React.FC = () => {
  const { pastStates, futureStates, undo, redo } = useHistoryStore();

  return (
    <div className="flex items-center space-x-1 mr-2">
      <button 
        onClick={undo}
        disabled={pastStates.length === 0}
        className="btn-icon w-7 h-7 flex items-center justify-center disabled:opacity-50"
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
      </button>
      <button 
        onClick={redo}
        disabled={futureStates.length === 0}
        className="btn-icon w-7 h-7 flex items-center justify-center disabled:opacity-50"
        title="Redo (Ctrl+Y)"
      >
        <Redo size={14} />
      </button>
    </div>
  );
};