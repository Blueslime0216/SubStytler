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
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <Undo className="w-4 h-4" />
            <span className="text-sm">Undo</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <Redo className="w-4 h-4" />
            <span className="text-sm">Redo</span>
          </motion.button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {historyItems.map((item, index) => (
          <motion.div
            key={item.id}
            className="p-3 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getActionIcon(item.type)}</span>
              
              <div className="flex-1">
                <p className="text-sm text-white">{item.action}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-800 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">
          {historyItems.length} actions in history
        </p>
      </div>
    </div>
  );
};