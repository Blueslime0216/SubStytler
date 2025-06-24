import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Grid, Layers } from 'lucide-react';

interface TimelineToolbarProps {
  onAddSubtitle: () => void;
  onZoom: (direction: 'in' | 'out') => void;
  zoom: number;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({ onAddSubtitle, onZoom, zoom }) => (
  <div className="neu-timeline-ruler flex items-center justify-between p-4">
    <div className="flex items-center space-x-4">
      <motion.button
        onClick={onAddSubtitle}
        className="neu-btn-primary flex items-center space-x-2 neu-interactive"
        title="Add new subtitle at current time"
      >
        <Plus className="w-4 h-4" />
        <span className="font-semibold">Add Subtitle</span>
      </motion.button>
      <div className="flex items-center space-x-3 neu-card-small px-3 py-2">
        <Grid className="w-4 h-4 neu-text-secondary" />
        <span className="neu-caption font-semibold">Frame Grid</span>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3 neu-card-small px-3 py-2">
        <Layers className="w-4 h-4 neu-text-secondary" />
        <span className="neu-caption font-semibold neu-clickable" title="Track settings">Track 1</span>
      </div>
      <div className="flex items-center space-x-3">
        <motion.button
          onClick={() => onZoom('out')}
          className="neu-btn-icon p-2 neu-interactive"
          title="Zoom out timeline"
        >
          <ZoomOut className="w-4 h-4" />
        </motion.button>
        <div className="neu-card-small px-3 py-2 neu-caption font-mono font-semibold min-w-[60px] text-center">
          {zoom.toFixed(1)}x
        </div>
        <motion.button
          onClick={() => onZoom('in')}
          className="neu-btn-icon p-2 neu-interactive"
          title="Zoom in timeline"
        >
          <ZoomIn className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  </div>
);

export default TimelineToolbar; 