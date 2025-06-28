import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useSelectedSubtitleStore } from '../../stores/selectedSubtitleStore';

export const TextEditorPanel: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState('default');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textOpacity, setTextOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState('100%');
  const [fontFamily, setFontFamily] = useState('0');
  const [textAlignment, setTextAlignment] = useState(3);
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineType, setOutlineType] = useState(0);
  const [anchorPoint, setAnchorPoint] = useState(4);
  const [printDirection, setPrintDirection] = useState('00');
  
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
        setTextOpacity(style.fo !== undefined ? style.fo : 1);
        setBackgroundColor(style.bc || '#000000');
        setBackgroundOpacity(style.bo !== undefined ? style.bo : 0.5);
        setFontSize(style.sz || '100%');
        setFontFamily(style.fs || '0');
        setTextAlignment(style.ju || 3);
        setOutlineColor(style.ec || '#000000');
        setOutlineType(style.et || 0);
        setAnchorPoint(style.ap || 4);
        setPrintDirection(style.pd || '00');
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
    if (!currentSubtitle) return;
    
    let newText = selectedText;
    
    switch (style) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'underline':
        newText = `__${selectedText}__`;
        break;
    }
    
    handleTextChange(newText);
  };

  const getFontFamilyName = (value: string) => {
    switch (value) {
      case '1': return 'Courier New';
      case '2': return 'Times New Roman';
      case '3': return 'Lucida Console';
      case '4': return 'Roboto';
      case '5': return 'Comic Sans MS';
      case '6': return 'Monotype Corsiva';
      case '7': return 'Arial';
      default: return 'Roboto';
    }
  };

  const getOutlineStyleName = (value: number) => {
    switch (value) {
      case 1: return 'Hard Shadow';
      case 2: return 'Bevel';
      case 3: return 'Glow/Outline';
      case 4: return 'Soft Shadow';
      default: return 'None';
    }
  };

  const getAnchorPointName = (value: number) => {
    switch (value) {
      case 0: return 'Top-Left';
      case 1: return 'Top-Center';
      case 2: return 'Top-Right';
      case 3: return 'Middle-Left';
      case 4: return 'Center';
      case 5: return 'Middle-Right';
      case 6: return 'Bottom-Left';
      case 7: return 'Bottom-Center';
      case 8: return 'Bottom-Right';
      default: return 'Center';
    }
  };

  const getPrintDirectionName = (value: string) => {
    switch (value) {
      case '20': return 'Vertical RTL';
      case '21': return 'Vertical LTR';
      case '30': return 'Rotated 90° CCW, LTR';
      case '31': return 'Rotated 90° CCW, RTL';
      default: return 'Horizontal LTR';
    }
  };

  if (!currentSubtitle) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <Type className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a subtitle to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      {/* Text Editor */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Subtitle Text
        </label>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full bg-base-color shadow-inset rounded-lg p-3 text-sm text-text-primary resize-none"
          placeholder="Enter subtitle text..."
          rows={3}
        />
      </div>
      
      {/* Text Formatting */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Text Formatting
        </label>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => applyTextStyle('bold')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bold className="w-4 h-4 text-text-primary" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('italic')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Italic className="w-4 h-4 text-text-primary" />
          </motion.button>
          
          <motion.button
            onClick={() => applyTextStyle('underline')}
            className="p-2 bg-surface shadow-outset rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Underline className="w-4 h-4 text-text-primary" />
          </motion.button>
        </div>
      </div>
      
      {/* Text Alignment */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Text Alignment
        </label>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => {
              setTextAlignment(1);
              handleStyleChange('ju', 1);
            }}
            className={`p-2 rounded-lg ${textAlignment === 1 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => {
              setTextAlignment(3);
              handleStyleChange('ju', 3);
            }}
            className={`p-2 rounded-lg ${textAlignment === 3 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignCenter className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => {
              setTextAlignment(2);
              handleStyleChange('ju', 2);
            }}
            className={`p-2 rounded-lg ${textAlignment === 2 ? 'bg-primary text-white' : 'bg-surface shadow-outset'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AlignRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Color Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Text Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                handleStyleChange('fc', e.target.value);
              }}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                handleStyleChange('fc', e.target.value);
              }}
              className="flex-1 bg-base-color shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
          <div className="mt-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Opacity: {Math.round(textOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={textOpacity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setTextOpacity(value);
                handleStyleChange('fo', value);
              }}
              className="w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Background Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                handleStyleChange('bc', e.target.value);
              }}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value);
                handleStyleChange('bc', e.target.value);
              }}
              className="flex-1 bg-base-color shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
          <div className="mt-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Opacity: {Math.round(backgroundOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={backgroundOpacity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setBackgroundOpacity(value);
                handleStyleChange('bo', value);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Outline Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Outline Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={outlineColor}
              onChange={(e) => {
                setOutlineColor(e.target.value);
                handleStyleChange('ec', e.target.value);
              }}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={outlineColor}
              onChange={(e) => {
                setOutlineColor(e.target.value);
                handleStyleChange('ec', e.target.value);
              }}
              className="flex-1 bg-base-color shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Outline Style
          </label>
          <select
            value={outlineType}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setOutlineType(value);
              handleStyleChange('et', value);
            }}
            className="w-full bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>None</option>
            <option value={1}>Hard Shadow</option>
            <option value={2}>Bevel</option>
            <option value={3}>Glow/Outline</option>
            <option value={4}>Soft Shadow</option>
          </select>
        </div>
      </div>
      
      {/* Font Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              handleStyleChange('fs', e.target.value);
            }}
            className="w-full bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="0">Roboto (Default)</option>
            <option value="1">Courier New</option>
            <option value="2">Times New Roman</option>
            <option value="3">Lucida Console</option>
            <option value="4">Roboto</option>
            <option value="5">Comic Sans MS</option>
            <option value="6">Monotype Corsiva</option>
            <option value="7">Arial</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font Size
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                handleStyleChange('sz', e.target.value);
              }}
              className="flex-1 bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
            />
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                handleStyleChange('sz', e.target.value);
              }}
              className="bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value="75%">75%</option>
              <option value="100%">100%</option>
              <option value="125%">125%</option>
              <option value="150%">150%</option>
              <option value="200%">200%</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Position Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Anchor Point
          </label>
          <select
            value={anchorPoint}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setAnchorPoint(value);
              handleStyleChange('ap', value);
            }}
            className="w-full bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>Top-Left</option>
            <option value={1}>Top-Center</option>
            <option value={2}>Top-Right</option>
            <option value={3}>Middle-Left</option>
            <option value={4}>Center (Default)</option>
            <option value={5}>Middle-Right</option>
            <option value={6}>Bottom-Left</option>
            <option value={7}>Bottom-Center</option>
            <option value={8}>Bottom-Right</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Text Direction
          </label>
          <select
            value={printDirection}
            onChange={(e) => {
              setPrintDirection(e.target.value);
              handleStyleChange('pd', e.target.value);
            }}
            className="w-full bg-base-color shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="00">Horizontal LTR (Default)</option>
            <option value="20">Vertical RTL</option>
            <option value="21">Vertical LTR</option>
            <option value="30">Rotated 90° CCW, LTR</option>
            <option value="31">Rotated 90° CCW, RTL</option>
          </select>
        </div>
      </div>
      
      {/* Preview */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Preview
        </label>
        <div 
          className="bg-black p-4 rounded-lg shadow-inset-subtle"
          style={{
            display: 'flex',
            justifyContent: textAlignment === 1 ? 'flex-start' : textAlignment === 2 ? 'flex-end' : 'center',
            minHeight: '100px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '0.5em 1em',
              backgroundColor: `${backgroundColor}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
              color: `${textColor}${Math.round(textOpacity * 255).toString(16).padStart(2, '0')}`,
              fontFamily: getFontFamilyName(fontFamily),
              fontSize,
              textShadow: getOutlineStyleName(outlineType) !== 'None' 
                ? outlineType === 1 ? `2px 2px 0 ${outlineColor}` 
                : outlineType === 2 ? `1px 1px 0 ${outlineColor}, -1px -1px 0 ${outlineColor.replace('#', '#66')}` 
                : outlineType === 3 ? `0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}` 
                : `2px 2px 4px ${outlineColor}`
                : 'none',
              writingMode: printDirection === '20' || printDirection === '21' 
                ? printDirection === '20' ? 'vertical-rl' : 'vertical-lr'
                : 'horizontal-tb',
              textOrientation: printDirection === '20' || printDirection === '21' ? 'upright' : 'mixed',
              transform: printDirection === '30' || printDirection === '31' ? 'rotate(-90deg)' : 'none',
              direction: printDirection === '31' ? 'rtl' : 'ltr',
              textAlign: textAlignment === 1 ? 'left' : textAlignment === 2 ? 'right' : 'center',
            }}
          >
            {selectedText || 'Preview text will appear here'}
          </div>
        </div>
      </div>
      
      {/* Style Information */}
      <div className="bg-surface rounded-lg p-3 shadow-outset-subtle">
        <div className="text-xs text-text-secondary">
          <p className="mb-1"><strong>Current Style:</strong> {currentProject?.styles.find(s => s.id === selectedStyleId)?.name || 'Default'}</p>
          <p className="mb-1"><strong>Font:</strong> {getFontFamilyName(fontFamily)}</p>
          <p className="mb-1"><strong>Size:</strong> {fontSize}</p>
          <p className="mb-1"><strong>Outline:</strong> {getOutlineStyleName(outlineType)}</p>
          <p className="mb-1"><strong>Anchor:</strong> {getAnchorPointName(anchorPoint)}</p>
          <p><strong>Direction:</strong> {getPrintDirectionName(printDirection)}</p>
        </div>
      </div>
    </div>
  );
};