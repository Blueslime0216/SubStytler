import React from 'react';

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
  return (
    <>
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
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
          <div className="mt-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              불투명도: {(() => {
                const v = Math.round(textOpacity);
                const pct = Math.round((v / 255) * 100);
                return `${v} (${pct}%)`;
              })()}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={textOpacity}
              onChange={(e) => setTextOpacity(parseInt(e.target.value))}
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
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
          <div className="mt-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              불투명도: {(() => {
                const v = Math.round(backgroundOpacity);
                const pct = Math.round((v / 255) * 100);
                return `${v} (${pct}%)`;
              })()}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseInt(e.target.value))}
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
              onChange={(e) => setOutlineColor(e.target.value)}
              className="w-8 h-8 rounded shadow-inset border-none"
            />
            <input
              type="text"
              value={outlineColor}
              onChange={(e) => setOutlineColor(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-1 text-xs text-text-primary"
            />
          </div>
        </div>
        
        <div>
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
      </div>
      
      {/* Font Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font Family
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
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Font Size
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
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
            onChange={(e) => setAnchorPoint(parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
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
            onChange={(e) => setPrintDirection(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="00">Horizontal LTR (Default)</option>
            <option value="20">Vertical RTL</option>
            <option value="21">Vertical LTR</option>
            <option value="30">Rotated 90° CCW, LTR</option>
            <option value="31">Rotated 90° CCW, RTL</option>
          </select>
        </div>
      </div>
      
      {/* X / Y Position Sliders */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Horizontal Position (X%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={positionX}
            onChange={(e)=> setPositionX(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-text-secondary mt-1">{positionX}%</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Vertical Position (Y%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={positionY}
            onChange={(e)=> setPositionY(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-text-secondary mt-1">{positionY}%</div>
        </div>
      </div>
    </>
  );
};

export default TextEditorContent;