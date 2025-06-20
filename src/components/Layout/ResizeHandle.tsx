import React, { useState } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  direction, 
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isVertical = direction === 'vertical';

  return (
    <PanelResizeHandle
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragging={setIsDragging}
    >
      <div
        className={`
          relative flex items-center justify-center neu-resize-handle
          ${isVertical ? 'w-full h-1 cursor-row-resize' : 'w-1 h-full cursor-col-resize'}
          ${isDragging ? 'dragging' : ''}
        `}
      >
        {/* Resize Handle Visual Indicator */}
        <motion.div
          className={`
            absolute flex items-center justify-center rounded-full
            ${isVertical ? 'w-8 h-2' : 'w-2 h-8'}
            ${isDragging ? 'neu-shadow-2' : ''}
          `}
          style={{
            background: isDragging ? 'var(--neu-primary)' : isHovered ? 'var(--neu-accent)' : 'var(--neu-base)',
            border: `1px solid ${isDragging ? 'var(--neu-primary)' : 'var(--neu-dark)'}`
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered || isDragging ? 1 : 0,
            scale: isDragging ? 1.1 : isHovered ? 1.05 : 0.8
          }}
          transition={{ duration: 0.15 }}
        >
          {/* Grip Pattern */}
          <div className={`flex ${isVertical ? 'space-x-0.5' : 'flex-col space-y-0.5'}`}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 h-0.5 rounded-full"
                style={{
                  backgroundColor: isDragging ? 'white' : 'var(--neu-text)'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Extended Hit Area */}
        <div
          className={`
            absolute
            ${isVertical ? 'w-full h-3 -top-1.5' : 'w-3 h-full -left-1.5'}
          `}
        />
      </div>
    </PanelResizeHandle>
  );
};