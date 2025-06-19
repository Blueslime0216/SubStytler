import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, Palette, Type } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';

export const TextEditorPanel: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('default');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('100%');
  
  const { currentProject, updateSubtitle, updateStyle } = useProjectStore();
  const { currentTime } = useTimelineStore();

  const currentSubtitle = currentProject?.subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  useEffect(() => {
    if (currentSubtitle) {
      setSelectedText(currentSubtitle.spans[0]?.text || '');
      const styleId = currentSubtitle.spans[0]?.styleId || 'default';
      setSelectedStyleId(styleId);
      
      const style = currentProject?.styles.find(s => s.id === styleId);
      if (style) {
        setTextColor(style.fc || '#FFFFFF');
        setBackgroundColor(style.bc || '#000000');
        setFontSize(style.sz || '100%');
      }
    }
  }, [currentSubtitle, currentProject]);

  const handleTextChange = (text: string) => {
    setSelectedText(text);
    if (currentSubtitle) {
      const updatedSpans = [...currentSubtitle.spans];
      if (updatedSpans[0]) {
        updatedSpans[0].text = text;
      }
      updateSubtitle(currentSubtitle.id, { spans: updatedSpans });
    }
  };

  const handleStyleChange = (property: string, value: any) => {
    if (selectedStyleId) {
      updateStyle(selectedStyleId, { [property]: value });
    }
  };

  const applyTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    // Apply styling to selected text or current cursor position
    console.log('Applying style:', style);
  };

  if (!currentSubtitle) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a subtitle to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Text Editor */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subtitle Text
        </label>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter subtitle text..."
        />
      </div>
      
      {/* Text Formatting */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyTextStyle('bold')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyTextStyle('italic')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => applyTextStyle('underline')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Underline className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Color Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleStyleChange('fc', e.target.value);
                }}
                className="w-8 h-8 rounded border border-gray-600 bg-gray-800"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleStyleChange('fc', e.target.value);
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleStyleChange('bc', e.target.value);
                }}
                className="w-8 h-8 rounded border border-gray-600 bg-gray-800"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleStyleChange('bc', e.target.value);
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Font Size */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              handleStyleChange('sz', e.target.value);
            }}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            <option value="50%">Small (50%)</option>
            <option value="75%">Medium (75%)</option>
            <option value="100%">Normal (100%)</option>
            <option value="125%">Large (125%)</option>
            <option value="150%">Extra Large (150%)</option>
            <option value="200%">Huge (200%)</option>
          </select>
        </div>
      </div>
      
      {/* Preview */}
      <div className="border-t border-gray-700 pt-4">
        <label className="block text-xs text-gray-400 mb-2">Preview</label>
        <div 
          className="p-3 rounded-lg border border-gray-600 min-h-[60px] flex items-center justify-center"
          style={{ 
            backgroundColor: backgroundColor + '80', // Add transparency
            color: textColor,
            fontSize: fontSize === '100%' ? '16px' : fontSize === '125%' ? '20px' : fontSize === '150%' ? '24px' : fontSize === '200%' ? '32px' : fontSize === '75%' ? '12px' : '10px'
          }}
        >
          {selectedText || 'Preview text will appear here'}
        </div>
      </div>
    </div>
  );
};