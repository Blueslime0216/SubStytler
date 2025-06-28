import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo, Redo } from 'lucide-react';
import { useHistoryStore } from '../../stores/historyStore';
import { Portal } from '../UI/Portal';

export const HistoryPanel: React.FC = () => {
  const { getVisibleHistory, undo, redo, jumpTo } = useHistoryStore();
  
  // 🆕 Use getVisibleHistory to get filtered history without "Before" entries
  const { pastStates, present, futureStates } = getVisibleHistory();

  const [tooltip, setTooltip] = useState<{ entry: any; x: number; y: number } | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, entry: any) => {
    clearHoverTimer();
    const { clientX, clientY } = e;
    hoverTimer.current = window.setTimeout(() => {
      setTooltip({ entry, x: clientX, y: clientY });
    }, 200);
  };

  const handleMouseLeave = () => {
    clearHoverTimer();
    setTooltip(null);
  };

  const handleClick = (entry: any, isCurrent: boolean) => {
    if (!isCurrent) {
      jumpTo(entry.timestamp);
    }
  };

  const renderEntry = (
    entry: { description: string; timestamp: number; snapshot?: unknown },
    uniqueKey: string,
    isCurrent = false,
    isFuture = false,
  ) => (
    <div
      key={uniqueKey}
      className={`flex items-center space-x-1 py-1 px-2 rounded-sm hover:bg-neutral-800/20 cursor-pointer transition-shadow ${
        isCurrent ? 'history-entry-present' : isFuture ? 'history-entry-future' : ''
      }`}
      onMouseEnter={(ev) => handleMouseEnter(ev, entry)}
      onMouseLeave={handleMouseLeave}
      onClick={() => handleClick(entry, isCurrent)}
    >
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

      {/* History list - now shows only user-visible entries */}
      <div className="flex-1 overflow-y-auto text-xs neu-text-secondary px-2 py-1 space-y-1">
        {/* Past (oldest at top) */}
        {pastStates.map((e, idx) => renderEntry(e, `${e.timestamp}-${idx}`))}

        {/* Present */}
        {present && renderEntry(present, `${present.timestamp}-present`, true)}

        {/* Future */}
        {futureStates.map((e, idx) => renderEntry(e, `${e.timestamp}-f${idx}`, false, true))}

        {/* Empty state */}
        {pastStates.length === 0 && !present && futureStates.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-neutral-500">
            No history
          </div>
        )}
      </div>

      {/* Tooltip */}
      <Portal>
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="neu-tooltip"
              style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
            >
              <div className="font-semibold">{tooltip.entry.description}</div>
              <div className="text-xs opacity-70">{new Date(tooltip.entry.timestamp).toLocaleString()}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
};