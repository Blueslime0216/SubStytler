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

  // Get text and styling properties
  const span = currentSubtitle.spans[0] || { text: '' };
  const text = span.text || '';
  const isBold = span.isBold || false;
  const isItalic = span.isItalic || false;
  const isUnderline = span.isUnderline || false;

  // Calculate position based on anchor point
  const getPositionStyle = () => {
    const ap = style?.ap || 4; // Default to center (4)
    
    // Horizontal alignment
    let alignX = 'center';
    if (ap === 0 || ap === 3 || ap === 6) alignX = 'flex-start'; // Left
    if (ap === 2 || ap === 5 || ap === 8) alignX = 'flex-end'; // Right
    
    // Vertical alignment
    let alignY = 'center';
    if (ap === 0 || ap === 1 || ap === 2) alignY = 'flex-start'; // Top
    if (ap === 6 || ap === 7 || ap === 8) alignY = 'flex-end'; // Bottom
    
    // Text alignment
    let textAlign = 'center';
    const ju = style?.ju || 3; // Default to center (3)
    if (ju === 1) textAlign = 'left';
    if (ju === 2) textAlign = 'right';
    
    return {
      justifyContent: alignX,
      alignItems: alignY,
      textAlign
    };
  };

  // Get font family
  const getFontFamily = () => {
    const fs = style?.fs || '0';
    
    switch (fs) {
      case '1': return 'Courier New, monospace';
      case '2': return 'Times New Roman, serif';
      case '3': return 'Lucida Console, monospace';
      case '4': return 'Roboto, sans-serif';
      case '5': return 'Comic Sans MS, cursive';
      case '6': return 'Monotype Corsiva, cursive';
      case '7': return 'Arial, sans-serif';
      default: return 'Roboto, sans-serif';
    }
  };

  // Get text outline style
  const getTextOutlineStyle = () => {
    const et = style?.et;
    const ec = style?.ec || '#000000';
    
    if (!et) return {};
    
    switch (et) {
      case 1: // Hard shadow
        return { textShadow: `2px 2px 0 ${ec}` };
      case 2: // Bevel
        return { textShadow: `1px 1px 0 ${ec}, -1px -1px 0 ${ec.replace('#', '#66')}` };
      case 3: // Glow/Outline
        return { textShadow: `0 0 3px ${ec}, 0 0 3px ${ec}, 0 0 3px ${ec}, 0 0 3px ${ec}` };
      case 4: // Soft shadow
        return { textShadow: `2px 2px 4px ${ec}` };
      default:
        return {};
    }
  };

  // Get vertical text orientation
  const getVerticalTextStyle = () => {
    const pd = style?.pd || '00'; // Default horizontal LTR
    
    switch (pd) {
      case '20': // Vertical RTL
        return { 
          writingMode: 'vertical-rl',
          textOrientation: 'upright'
        };
      case '21': // Vertical LTR
        return { 
          writingMode: 'vertical-lr',
          textOrientation: 'upright'
        };
      case '30': // Rotated 90° CCW, LTR
        return { 
          transform: 'rotate(-90deg)',
          writingMode: 'horizontal-tb'
        };
      case '31': // Rotated 90° CCW, RTL
        return { 
          transform: 'rotate(-90deg)',
          writingMode: 'horizontal-tb',
          direction: 'rtl'
        };
      default: // Horizontal LTR
        return { 
          writingMode: 'horizontal-tb'
        };
    }
  };

  // Calculate font size
  const getFontSize = () => {
    const sz = style?.sz || '100%';
    return sz;
  };

  // Calculate opacity values
  const getOpacities = () => {
    const fontOpacity = style?.fo !== undefined ? style.fo : 1;
    const bgOpacity = style?.bo !== undefined ? style.bo : 0.5;
    
    return { fontOpacity, bgOpacity };
  };

  const positionStyle = getPositionStyle();
  const fontFamily = getFontFamily();
  const textOutlineStyle = getTextOutlineStyle();
  const verticalTextStyle = getVerticalTextStyle();
  const fontSize = getFontSize();
  const { fontOpacity, bgOpacity } = getOpacities();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        <motion.div 
          className="max-w-4xl w-full px-4"
          style={{
            position: 'absolute',
            bottom: '10%',
            left: 0,
            right: 0,
            display: 'flex',
            ...positionStyle
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '0.5em 1em',
              backgroundColor: style?.bc ? `${style.bc}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent',
              color: style?.fc ? `${style.fc}${Math.round(fontOpacity * 255).toString(16).padStart(2, '0')}` : '#FFFFFF',
              fontFamily,
              fontSize,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              ...textOutlineStyle,
              ...verticalTextStyle
            }}
          >
            {text}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};