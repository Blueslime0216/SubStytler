import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface StyleManagerToolbarProps {
  onCreateNewStyle: () => void;
}

const StyleManagerToolbar: React.FC<StyleManagerToolbarProps> = ({ onCreateNewStyle }) => (
  <div className="neu-panel-header">
    <motion.button
      onClick={onCreateNewStyle}
      className="neu-btn-primary flex items-center space-x-2"
    >
      <Plus className="w-3.5 h-3.5" />
      <span className="text-xs">New Style</span>
    </motion.button>
  </div>
);

export default StyleManagerToolbar; 