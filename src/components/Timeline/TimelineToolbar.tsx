import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineToolbarProps {
  onAddSubtitle: () => void;
  onZoom: (direction: 'in' | 'out') => void;
  zoom: number;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  onAddSubtitle,
  onZoom,
  zoom
}) => {
  return (
    <div className="timeline-ruler flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddSubtitle}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Subtitle</span>
        </motion.button>
      </div>
      
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onZoom('out')}
          className="btn-ghost p-2"
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>
        
        <div className="px-3 py-1 rounded-lg text-sm font-medium" style={{ 
          backgroundColor: 'var(--bg-tertiary)', 
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          {zoom.toFixed(1)}x
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onZoom('in')}
          className="btn-ghost p-2"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};