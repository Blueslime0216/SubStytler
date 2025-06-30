import React, { useState } from 'react';
import KeyframeButton from '../../../UI/KeyframeButton';
import ColorPicker from '../../../UI/ColorPicker';

interface StyleTabProps {
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  setTextColor: (value: string) => void;
  setTextOpacity: (value: number) => void;
  setBackgroundColor: (value: string) => void;
  setBackgroundOpacity: (value: number) => void;
}

const StyleTab: React.FC<StyleTabProps> = ({
  textColor,
  textOpacity,
  backgroundColor,
  backgroundOpacity,
  setTextColor,
  setTextOpacity,
  setBackgroundColor,
  setBackgroundOpacity
}) => {
  // 색상 피커 표시 상태
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  
  // 색상 RGBA 변환
  const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 255})`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* 텍스트 색상 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          텍스트 색상
        </h3>
        
        <div className="space-y-4">
          {/* 색상 선택기 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-secondary">텍스트 색상</label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded cursor-pointer border border-border-color"
                  style={{ backgroundColor: textColor }}
                  onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                />
                <KeyframeButton property="fc" getCurrentValue={() => textColor} />
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
          </div>
          
          {/* 불투명도 슬라이더 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-secondary">
                텍스트 불투명도: {Math.round((textOpacity / 255) * 100)}%
              </label>
              <KeyframeButton property="fo" getCurrentValue={() => textOpacity} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={255}
                value={textOpacity}
                onChange={(e) => setTextOpacity(parseInt(e.target.value))}
                className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={255}
                value={textOpacity}
                onChange={(e) => setTextOpacity(parseInt(e.target.value) || 0)}
                className="w-16 bg-bg shadow-inset rounded p-1 text-xs text-text-primary text-center"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 배경 색상 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          배경 색상
        </h3>
        
        <div className="space-y-4">
          {/* 색상 선택기 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-secondary">배경 색상</label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded cursor-pointer border border-border-color"
                  style={{ backgroundColor: backgroundColor }}
                  onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                />
                <KeyframeButton property="bc" getCurrentValue={() => backgroundColor} />
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
          </div>
          
          {/* 불투명도 슬라이더 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-secondary">
                배경 불투명도: {Math.round((backgroundOpacity / 255) * 100)}%
              </label>
              <KeyframeButton property="bo" getCurrentValue={() => backgroundOpacity} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={255}
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseInt(e.target.value))}
                className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={255}
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseInt(e.target.value) || 0)}
                className="w-16 bg-bg shadow-inset rounded p-1 text-xs text-text-primary text-center"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 미리보기 섹션 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          색상 미리보기
        </h3>
        
        <div className="p-4 bg-bg rounded-lg flex items-center justify-center">
          <div
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: hexToRgba(backgroundColor, backgroundOpacity),
              color: hexToRgba(textColor, textOpacity),
            }}
          >
            샘플 텍스트
          </div>
        </div>
        
        {/* 색상 조합 프리셋 */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { text: '#FFFFFF', bg: '#000000' },
            { text: '#FFFF00', bg: '#000000' },
            { text: '#000000', bg: '#FFFFFF' },
            { text: '#FFFFFF', bg: '#0000FF' },
            { text: '#FFFFFF', bg: '#FF0000' },
            { text: '#000000', bg: '#00FF00' },
            { text: '#FFFFFF', bg: '#800080' },
            { text: '#FFFF00', bg: '#800000' },
          ].map((preset, index) => (
            <button
              key={index}
              className="p-2 rounded border border-border-color hover:border-primary transition-colors"
              onClick={() => {
                setTextColor(preset.text);
                setBackgroundColor(preset.bg);
              }}
            >
              <div
                className="w-full h-8 rounded flex items-center justify-center text-xs"
                style={{
                  backgroundColor: preset.bg,
                  color: preset.text,
                }}
              >
                Aa
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StyleTab; 