import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubtitleBlockProps } from './SubtitleBlockTypes';

interface SubtitleBlockViewProps extends SubtitleBlockProps {
  left: number;
  displayWidth: number;
  isDragging: boolean;
  isDropInvalid: boolean;
  isResizeInvalid: boolean;
  dragOffset: { x: number; y: number };
  isSelected: boolean;
  isHighlighted: boolean;
  isLocked: boolean;
  isSnapHighlighted?: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleClick: () => void;
  startResize: (e: React.MouseEvent, side: 'left' | 'right') => void;
}

export const SubtitleBlockView: React.FC<SubtitleBlockViewProps> = ({
  left,
  displayWidth,
  isDragging,
  isDropInvalid,
  isResizeInvalid,
  dragOffset,
  isSelected,
  isHighlighted,
  isLocked,
  isSnapHighlighted = false,
  handleMouseDown,
  handleClick,
  startResize,
  subtitle
}) => {
  // Get the first span for display
  const span = subtitle.spans[0] || { text: '' };
  const isBold = span.isBold || false;
  const isItalic = span.isItalic || false;
  const isUnderline = span.isUnderline || false;

  return (
    <motion.div
      className={`neu-subtitle-block absolute ${!isLocked ? 'cursor-move' : 'cursor-not-allowed'}`}
      style={{
        left: left + (isDragging ? dragOffset.x : 0),
        width: displayWidth,
        top: `${7 + (isDragging ? dragOffset.y : 0)}px`,
        height: '36px',
        opacity: isLocked ? 0.7 : 1,
        zIndex: isDragging ? 1000 : 10,
        pointerEvents: isDragging ? 'none' : 'auto',
        outline: isSelected ? '2px solid var(--highlight-color)' : 'none',
        backgroundColor: (isDragging && isDropInvalid) || isResizeInvalid ? 'var(--error-color)' : 'var(--mid-color)',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      title={`${span.text || 'Empty subtitle'} - Drag to move`}
      tabIndex={0}
      animate={{
        scale: isDragging ? 1.05 : 1,
        boxShadow: isDragging ? "0 8px 25px rgba(0,0,0,0.3)" : "var(--shadow-outset-subtle)",
      }}
      transition={{ duration: 0.2 }}
      data-subtitle-id={subtitle.id}
    >
      {/* Snap highlight effect */}
      {isSnapHighlighted && (
        <motion.div
          className="neu-subtitle-snap-highlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            className="neu-subtitle-highlight-pulse"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 0.6 }}
            exit={{ scale: 1, opacity: 0, transition: { duration: 0.05 } }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>
      <div 
        className="text-sm text-white font-semibold truncate"
        style={{
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none'
        }}
      >
        {span.text || 'Empty subtitle'}
      </div>
      
      {/* Visual indicator when dragging */}
      {isDragging && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-400 rounded-lg pointer-events-none" />
      )}

      {/* Resize Handles */}
      {!isLocked && (
        <>
          <div
            className="neu-subtitle-handle left-0"
            onMouseDown={(e) => startResize(e, 'left')}
          />
          <div
            className="neu-subtitle-handle right-0"
            onMouseDown={(e) => startResize(e, 'right')}
          />
        </>
      )}
    </motion.div>
  );
};