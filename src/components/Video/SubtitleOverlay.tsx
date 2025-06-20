import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '../../stores/timelineStore';
import { useProjectStore } from '../../stores/projectStore';

export const SubtitleOverlay: React.FC = () => {
  const { currentTime } = useTimelineStore();
  const { currentProject } = useProjectStore();

  // Find current subtitle
  const currentSubtitle = currentProject?.subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  if (!currentSubtitle) return null;

  // Get style for the subtitle
  const style = currentProject?.styles.find(
    s => s.id === (currentSubtitle.spans[0]?.styleId || 'default')
  );

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 max-w-4xl w-full px-4">
      <AnimatePresence>
        <motion.div 
          className="neu-card text-center p-4"
          style={{
            background: style?.bc ? `${style.bc}CC` : 'var(--neu-base)CC',
            color: style?.fc || 'var(--neu-text-primary)',
            backdropFilter: 'blur(12px)'
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <span 
            className="font-medium leading-relaxed"
            style={{
              fontFamily: style?.fs === 'serif' ? 'serif' : 
                         style?.fs === 'monospace' ? 'monospace' : 
                         style?.fs === 'cursive' ? 'cursive' : 'sans-serif',
              fontSize: style?.sz === '50%' ? '0.75rem' :
                       style?.sz === '75%' ? '0.875rem' :
                       style?.sz === '125%' ? '1.25rem' :
                       style?.sz === '150%' ? '1.5rem' :
                       style?.sz === '200%' ? '2rem' : '1rem'
            }}
          >
            {currentSubtitle.spans[0]?.text || ''}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};