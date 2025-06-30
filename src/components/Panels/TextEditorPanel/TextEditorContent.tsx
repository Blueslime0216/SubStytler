import React, { useState } from 'react';
import { Palette, Type, Sliders, Layout, Pipette } from 'lucide-react';
import KeyframeButton from '../../UI/KeyframeButton';
import CollapsibleSection from '../../UI/CollapsibleSection';
import CustomRangeInput from '../../UI/CustomRangeInput';
import ColorPicker from '../../UI/ColorPicker';

interface TextEditorContentProps {
  selectedText: string;
  handleTextChange: (text: string) => void;
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: string;
  fontFamily: string;
  outlineColor: string;
  outlineType: number;
  anchorPoint: number;
  positionX: number;
  positionY: number;
  printDirection: string;
  setTextColor: (value: string) => void;
  setTextOpacity: (value: number) => void;
  setBackgroundColor: (value: string) => void;
  setBackgroundOpacity: (value: number) => void;
  setFontSize: (value: string) => void;
  setFontFamily: (value: string) => void;
  setOutlineColor: (value: string) => void;
  setOutlineType: (value: number) => void;
  setAnchorPoint: (value: number) => void;
  setPrintDirection: (value: string) => void;
  setPositionX: (value: number) => void;
  setPositionY: (value: number) => void;
}

const TextEditorContent: React.FC<TextEditorContentProps> = ({
  selectedText,
  handleTextChange,
  textColor,
  textOpacity,
  backgroundColor,
  backgroundOpacity,
  fontSize,
  fontFamily,
  outlineColor,
  outlineType,
  anchorPoint,
  positionX,
  positionY,
  printDirection,
  setTextColor,
  setTextOpacity,
  setBackgroundColor,
  setBackgroundOpacity,
  setFontSize,
  setFontFamily,
  setOutlineColor,
  setOutlineType,
  setAnchorPoint,
  setPrintDirection,
  setPositionX,
  setPositionY
}) => {
  // Color picker display state
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState(false);

  // Font size direct input handler
  const handleFontSizeChange = (value: string) => {
    // Extract numbers and add '%'
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setFontSize(`${numericValue}%`);
    }
  };

  return (
    <div className="p-4">
      {/* Text Editor */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Subtitle Text
        </label>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full bg-bg shadow-inset rounded-lg p-3 text-sm text-text-primary resize-none"
          placeholder="Enter subtitle text..."
          rows={3}
        />
      </div>
      
      {/* Color & Style Section */}
      <CollapsibleSection 
        title="Color & Opacity" 
        defaultOpen={true}
        icon={<Palette className="w-4 h-4 text-primary" />}
      >
        {/* Text Color */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">Text Color</label>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded cursor-pointer border border-border-color"
                style={{ backgroundColor: textColor }}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              />
              <KeyframeButton property="fc" getCurrentValue={() => textColor}/>
            </div>
          </div>
          
          {showTextColorPicker && (
            <div className="relative z-10">
              <div className="absolute right-0">
                <ColorPicker
                  color={textColor}
                  onChange={setTextColor}
                  onClose={() => setShowTextColorPicker(false)}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CustomRangeInput
              min={0}
              max={255}
              value={textOpacity}
              onChange={setTextOpacity}
              label="Text Opacity"
              unit=""
            />
            <KeyframeButton property="fo" getCurrentValue={() => textOpacity} />
          </div>
        </div>
        
        {/* Background Color */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">Background Color</label>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded cursor-pointer border border-border-color"
                style={{ backgroundColor: backgroundColor }}
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              />
            </div>
          </div>
          
          {showBgColorPicker && (
            <div className="relative z-10">
              <div className="absolute right-0">
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                  onClose={() => setShowBgColorPicker(false)}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CustomRangeInput
              min={0}
              max={255}
              value={backgroundOpacity}
              onChange={setBackgroundOpacity}
              label="Background Opacity"
              unit=""
            />
            <KeyframeButton property="bo" getCurrentValue={() => backgroundOpacity} />
          </div>
        </div>
      </CollapsibleSection>
      
      {/* Font & Size Section */}
      <CollapsibleSection 
        title="Font & Size" 
        defaultOpen={true}
        icon={<Type className="w-4 h-4 text-primary" />}
      >
        {/* Font Select */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
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
        
        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font Size
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
              placeholder="e.g., 150%"
            />
            <KeyframeButton property="sz" getCurrentValue={() => fontSize} />
          </div>
        </div>
      </CollapsibleSection>
      
      {/* Outline & Effects Section */}
      <CollapsibleSection 
        title="Outline & Effects" 
        icon={<Sliders className="w-4 h-4 text-primary" />}
      >
        {/* Outline Color */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">Outline Color</label>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded cursor-pointer border border-border-color"
                style={{ backgroundColor: outlineColor }}
                onClick={() => setShowOutlineColorPicker(!showOutlineColorPicker)}
              />
              <KeyframeButton property="ec" getCurrentValue={() => outlineColor} />
            </div>
          </div>
          
          {showOutlineColorPicker && (
            <div className="relative z-10">
              <div className="absolute right-0">
                <ColorPicker
                  color={outlineColor}
                  onChange={setOutlineColor}
                  onClose={() => setShowOutlineColorPicker(false)}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Outline Style */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Outline Style
          </label>
          <select
            value={outlineType}
            onChange={(e) => setOutlineType(parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>None</option>
            <option value={1}>Hard Shadow</option>
            <option value={2}>Bevel</option>
            <option value={3}>Glow/Outline</option>
            <option value={4}>Soft Shadow</option>
          </select>
        </div>
      </CollapsibleSection>
      
      {/* Position & Direction Section */}
      <CollapsibleSection 
        title="Position & Direction" 
        icon={<Layout className="w-4 h-4 text-primary" />}
      >
        {/* Anchor Point */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Anchor Point
          </label>
          <select
            value={anchorPoint}
            onChange={(e) => setAnchorPoint(parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>Top Left</option>
            <option value={1}>Top Center</option>
            <option value={2}>Top Right</option>
            <option value={3}>Middle Left</option>
            <option value={4}>Middle Center (Default)</option>
            <option value={5}>Middle Right</option>
            <option value={6}>Bottom Left</option>
            <option value={7}>Bottom Center</option>
            <option value={8}>Bottom Right</option>
          </select>
        </div>
        
        {/* Text Direction */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Text Direction
          </label>
          <select
            value={printDirection}
            onChange={(e) => setPrintDirection(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="00">Horizontal LTR (Default)</option>
            <option value="20">Vertical RTL</option>
            <option value="21">Vertical LTR</option>
            <option value="30">Rotated 90°, LTR</option>
            <option value="31">Rotated 90°, RTL</option>
          </select>
        </div>
        
        {/* Horizontal Position */}
        <div className="mb-4">
          <CustomRangeInput
            min={0}
            max={100}
            value={positionX}
            onChange={(value: number)=>{
              const intVal = Math.round(value);
              setPositionX(intVal);
              handleStyleChange('ah', intVal);
            }}
            label="Horizontal Position (X%)"
            unit="%"
          />
          <KeyframeButton property="ah" getCurrentValue={() => positionX} />
        </div>
        
        {/* Vertical Position */}
        <div className="mb-4">
          <CustomRangeInput
            min={0}
            max={100}
            value={positionY}
            onChange={(value: number)=>{
              const intVal = Math.round(value);
              setPositionY(intVal);
              handleStyleChange('av', intVal);
            }}
            label="Vertical Position (Y%)"
            unit="%"
          />
          <KeyframeButton property="av" getCurrentValue={() => positionY} />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TextEditorContent;