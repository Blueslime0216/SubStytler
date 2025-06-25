import React from 'react';
import { motion } from 'framer-motion';
import { Undo, Redo } from 'lucide-react';
import { useHistoryStore } from '../../stores/historyStore';

export const HistoryPanel: React.FC = () => {
  const { pastStates, futureStates, undo, redo } = useHistoryStore();

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  return (
    <div className="neu-history-panel h-full flex flex-col">
      {/* Controls */}
      <div className="neu-panel-header">
        <div className="flex items-center space-x-2">
          <motion.button
            disabled={!canUndo}
            onClick={() => canUndo && undo()}
            className={`neu-btn flex items-center space-x-1 ${!canUndo ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Undo className="w-3.5 h-3.5" />
            <span className="text-xs">Undo</span>
          </motion.button>
          
          <motion.button
            disabled={!canRedo}
            onClick={() => canRedo && redo()}
            className={`neu-btn flex items-center space-x-1 ${!canRedo ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Redo className="w-3.5 h-3.5" />
            <span className="text-xs">Redo</span>
          </motion.button>
        </div>
      </div>

      {/* Simple history indicator */}
      <div className="flex-1 flex items-center justify-center text-xs neu-text-secondary">
        {canUndo || canRedo ? (
          <span>{pastStates.length} undo · {futureStates.length} redo</span>
        ) : (
          <span>No history</span>
        )}
      </div>
    </div>
  );
};