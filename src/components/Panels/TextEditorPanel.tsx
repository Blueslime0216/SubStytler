import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, Type } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';

export const TextEditorPanel: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('default');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('100%');
  
  const { currentProject, updateSubtitle, updateStyle } = useProjectStore();
  const { currentTime } = useTimelineStore();
  const { selectedSubtitleId } = useSelectedSubtitleStore();

  // Determine subtitle: prefer explicitly selected, fall back to one at playhead.
  const currentSubtitle = selectedSubtitleId
    ? currentProject?.subtitles.find(sub => sub.id === selectedSubtitleId)
    : currentProject?.subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);

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
    console.log('Applying style:', style);
  };

  if (!currentSubtitle) {
    return (
      <div className="text-editor-panel items-center justify-center text-secondary">
        <div className="text-center">
          <Type className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a subtitle to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-editor-panel">
      {/* Text Editor */}
      <div>
        <label className="text-editor-label">
          Subtitle Text
        </label>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="text-editor-textarea"
          placeholder="Enter subtitle text..."
        />
      </div>
      
      {/* Text Formatting */}
      <div className="space-y-3">
        <div className="text-editor-toolbar">
          <motion.button
            onClick={() => applyTextStyle('bold')}
            className="text-editor-toolbar-btn"
          >
            <Bold className="w-3.5 h-3.5" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('italic')}
            className="text-editor-toolbar-btn"
          >
            <Italic className="w-3.5 h-3.5" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('underline')}
            className="text-editor-toolbar-btn"
          >
            <Underline className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        
        {/* Color Controls */}
        <div className="text-editor-control-group">
          <div className="text-editor-control">
            <label className="text-editor-label">Text Color</label>
            <div className="text-editor-color-input-wrapper">
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleStyleChange('fc', e.target.value);
                }}
                className="text-editor-color-swatch"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  handleStyleChange('fc', e.target.value);
                }}
                className="text-editor-input"
              />
            </div>
          </div>
          
          <div className="text-editor-control">
            <label className="text-editor-label">Background</label>
            <div className="text-editor-color-input-wrapper">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleStyleChange('bc', e.target.value);
                }}
                className="text-editor-color-swatch"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  handleStyleChange('bc', e.target.value);
                }}
                className="text-editor-input"
              />
            </div>
          </div>
        </div>
        
        {/* Font Size */}
        <div className="text-editor-control">
          <label className="text-editor-label">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              handleStyleChange('sz', e.target.value);
            }}
            className="text-editor-select"
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
      <div className="text-editor-divider">
        <label className="text-editor-label">Preview</label>
        <div 
          className="text-editor-preview"
          style={{ 
            backgroundColor: backgroundColor + '80',
            color: textColor,
            fontSize: fontSize === '100%' ? '14px' : fontSize === '125%' ? '16px' : fontSize === '150%' ? '18px' : fontSize === '200%' ? '24px' : fontSize === '75%' ? '12px' : '10px'
          }}
        >
          {selectedText || 'Preview text will appear here'}
        </div>
      </div>
    </div>
  );
};