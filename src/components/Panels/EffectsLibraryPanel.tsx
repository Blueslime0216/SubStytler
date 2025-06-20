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
    <div className="neu-effects-library-panel h-full p-3">
      <div className="mb-3">
        <h3 className="text-base font-semibold neu-text-primary mb-2">Animation Effects</h3>
        <p className="text-xs neu-text-secondary">Drag effects to subtitle spans</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            draggable
            onDragStart={(e) => handleDragStart(e, effect.id)}
            className="neu-card p-3 cursor-move"
            whileDrag={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 neu-shadow-1 rounded-lg" style={{ background: 'var(--neu-primary)' }}>
                <effect.icon className="w-3.5 h-3.5 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium neu-text-primary text-sm">{effect.name}</h4>
                <p className="text-xs neu-text-secondary">{effect.category}</p>
              </div>
            </div>
            
            <p className="text-xs neu-text-secondary mt-2">{effect.description}</p>
            
            {/* Preview */}
            <div className="mt-3 neu-card-small">
              <motion.div
                className="text-center text-xs"
                style={{ color: 'var(--neu-primary)' }}
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
      
      <div className="mt-4">
        <h4 className="font-medium neu-text-primary mb-3 text-sm">Custom Keyframes</h4>
        <motion.button
          className="w-full neu-card p-3 neu-text-secondary hover:neu-text-primary transition-colors text-center text-xs"
        >
          + Create Custom Animation
        </motion.button>
      </div>
    </div>
  );
};