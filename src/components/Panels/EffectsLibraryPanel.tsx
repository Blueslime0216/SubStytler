import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, RotateCw, Move } from 'lucide-react';

const effects = [
  {
    id: 'fade-in',
    name: 'Fade In',
    icon: TrendingUp,
    category: 'Opacity',
    description: 'Gradually increase opacity'
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    icon: Move,
    category: 'Position',
    description: 'Slide text from bottom'
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    icon: Zap,
    category: 'Text',
    description: 'Type text character by character'
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    icon: RotateCw,
    category: 'Transform',
    description: 'Rotate text while scaling'
  }
];

export const EffectsLibraryPanel: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, effectId: string) => {
    e.dataTransfer.setData('text/plain', effectId);
  };

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Animation Effects</h3>
        <p className="text-sm text-gray-400">Drag effects to subtitle spans</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            draggable
            onDragStart={(e) => handleDragStart(e, effect.id)}
            className="p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-move hover:bg-gray-750 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileDrag={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded">
                <effect.icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-white">{effect.name}</h4>
                <p className="text-xs text-gray-400">{effect.category}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mt-2">{effect.description}</p>
            
            {/* Preview */}
            <div className="mt-3 p-2 bg-gray-900 rounded border border-gray-600">
              <motion.div
                className="text-center text-sm text-blue-400"
                animate={
                  effect.id === 'fade-in' ? { opacity: [0, 1] } :
                  effect.id === 'slide-up' ? { y: [20, 0] } :
                  effect.id === 'typewriter' ? { width: ['0%', '100%'] } :
                  effect.id === 'rotate-in' ? { rotate: [180, 0], scale: [0.5, 1] } :
                  {}
                }
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                Preview
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-white mb-3">Custom Keyframes</h4>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          + Create Custom Animation
        </motion.button>
      </div>
    </div>
  );
};