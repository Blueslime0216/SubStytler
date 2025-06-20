import React from 'react';
import { motion } from 'framer-motion';
import { Undo, Redo, Clock } from 'lucide-react';

const historyItems = [
  { id: 1, action: 'Added subtitle', time: '2 minutes ago', type: 'add' },
  { id: 2, action: 'Changed text color', time: '5 minutes ago', type: 'style' },
  { id: 3, action: 'Moved subtitle timing', time: '8 minutes ago', type: 'timing' },
  { id: 4, action: 'Created new style', time: '12 minutes ago', type: 'style' },
  { id: 5, action: 'Imported video file', time: '15 minutes ago', type: 'import' }
];

export const HistoryPanel: React.FC = () => {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'add': return '➕';
      case 'style': return '🎨';
      case 'timing': return '⏱️';
      case 'import': return '📁';
      default: return '✏️';
    }
  };

  return (
    <div className="neu-history-panel h-full flex flex-col">
      {/* Controls */}
      <div className="neu-panel-header">
        <div className="flex items-center space-x-2">
          <motion.button
            className="neu-btn flex items-center space-x-1"
          >
            <Undo className="w-3.5 h-3.5" />
            <span className="text-xs">Undo</span>
          </motion.button>
          
          <motion.button
            className="neu-btn flex items-center space-x-1"
          >
            <Redo className="w-3.5 h-3.5" />
            <span className="text-xs">Redo</span>
          </motion.button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {historyItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="neu-card p-3 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-base">{getActionIcon(item.type)}</span>
              
              <div className="flex-1">
                <p className="text-xs neu-text-primary">{item.action}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 neu-text-secondary" />
                  <span className="text-xs neu-text-secondary">{item.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="neu-panel-header text-center">
        <p className="text-xs neu-text-secondary">
          {historyItems.length} actions in history
        </p>
      </div>
    </div>
  );
};