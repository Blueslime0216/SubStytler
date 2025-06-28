import React from 'react';
import { motion } from 'framer-motion';
import { Undo, Redo } from 'lucide-react';
import { useHistoryStore } from '../../stores/historyStore';

export const HistoryPanel: React.FC = () => {
  const { pastStates, present, futureStates, undo, redo } = useHistoryStore();

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const renderEntry = (entry: { description: string; timestamp: number }, isCurrent = false) => (
    <div
      key={entry.timestamp}
      className={`flex items-center space-x-1 py-1 px-2 rounded-sm hover:bg-neutral-800/30 ${
        isCurrent ? 'bg-primary/20 font-semibold' : ''
      }`}
    >
      <span className={`w-3 h-3 inline-block ${isCurrent ? 'text-primary' : 'opacity-40'}`}>•</span>
      <span className="truncate text-xs">{entry.description}</span>
    </div>
  );

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

      {/* History list */}
      <div className="flex-1 overflow-y-auto text-xs neu-text-secondary px-2 py-1 space-y-1">
        {/* Past (oldest at top) */}
        {pastStates.map((e) => renderEntry(e))}

        {/* Present */}
        {present && renderEntry(present, true)}

        {/* Future */}
        {futureStates.map((e) => renderEntry(e))}

        {/* Empty state */}
        {pastStates.length === 0 && !present && futureStates.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-neutral-500">
            No history
          </div>
        )}
      </div>
    </div>
  );
};