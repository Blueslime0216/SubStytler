import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface StyleManagerToolbarProps {
  onCreateNewStyle: () => void;
}

const StyleManagerToolbar: React.FC<StyleManagerToolbarProps> = ({ onCreateNewStyle }) => (
  <div className="p-4 bg-surface shadow-outset-subtle">
    <motion.button
      onClick={onCreateNewStyle}
      className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg shadow-outset"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Plus className="w-4 h-4" />
      <span className="text-sm font-medium">New Style</span>
    </motion.button>
  </div>
);

export default StyleManagerToolbar;