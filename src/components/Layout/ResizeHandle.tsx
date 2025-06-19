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
          relative flex items-center justify-center resize-handle
          ${isVertical ? 'w-full h-1 cursor-row-resize' : 'w-1 h-full cursor-col-resize'}
          ${isDragging ? 'dragging' : ''}
        `}
      >
        {/* Resize Handle Visual Indicator */}
        <motion.div
          className={`
            absolute flex items-center justify-center rounded-full
            ${isVertical ? 'w-12 h-3' : 'w-3 h-12'}
            ${isDragging ? 'glow-purple' : ''}
          `}
          style={{
            backgroundColor: isDragging ? 'var(--accent-primary)' : isHovered ? 'var(--accent-secondary)' : 'var(--border-secondary)',
            border: `1px solid ${isDragging ? 'var(--accent-hover)' : 'var(--border-primary)'}`
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered || isDragging ? 1 : 0,
            scale: isDragging ? 1.2 : isHovered ? 1.1 : 0.8
          }}
          transition={{ duration: 0.15 }}
        >
          {/* Grip Pattern */}
          <div className={`flex ${isVertical ? 'space-x-1' : 'flex-col space-y-1'}`}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: isDragging ? 'white' : 'var(--text-muted)'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Extended Hit Area */}
        <div
          className={`
            absolute
            ${isVertical ? 'w-full h-4 -top-2' : 'w-4 h-full -left-2'}
          `}
        />

        {/* Drag Indicator Line */}
        {isDragging && (
          <motion.div
            className={`
              absolute opacity-60
              ${isVertical ? 'w-full h-0.5' : 'w-0.5 h-full'}
            `}
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
    </PanelResizeHandle>
  );
};