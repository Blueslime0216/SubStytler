import React, { useState, useRef, useEffect } from 'react';
import { Pipette, X, Check } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showEyeDropper?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  onClose,
  showEyeDropper = true
}) => {
  const [localColor, setLocalColor] = useState(color);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentColors');
      return saved ? JSON.parse(saved) : ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'];
    } catch {
      return ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // 색상 변경 시 로컬 스토리지에 최근 색상 저장
  useEffect(() => {
    if (color && color !== '#000000' && color !== '#FFFFFF') {
      const newRecentColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 10);
      setRecentColors(newRecentColors);
      localStorage.setItem('recentColors', JSON.stringify(newRecentColors));
    }
  }, [color]);

  // 색상 선택 핸들러
  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  // 색상 추출기 (Eye Dropper API)
  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert('브라우저가 EyeDropper API를 지원하지 않습니다.');
      return;
    }

    try {
      setIsPickingColor(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (e) {
      console.log('사용자가 색상 추출을 취소했습니다.');
    } finally {
      setIsPickingColor(false);
    }
  };

  // 미리 정의된 색상 팔레트
  const predefinedColors = [
    '#FFFFFF', '#F2F2F2', '#DDDDDD', '#AAAAAA', '#666666', '#333333', '#000000',
    '#FF0000', '#FF6600', '#FFCC00', '#FFFF00', '#CCFF00', '#00FF00', '#00FFCC',
    '#00CCFF', '#0066FF', '#0000FF', '#6600FF', '#CC00FF', '#FF00FF', '#FF0066'
  ];

  return (
    <div className="color-picker bg-surface p-3 rounded-lg shadow-lg border border-border-color w-64">
      {/* 현재 색상 미리보기 */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-10 h-10 rounded-md shadow-inset" 
          style={{ 
            backgroundColor: localColor,
            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
            border: '1px solid rgba(0,0,0,0.1)'
          }} 
        />
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          />
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-bg rounded-full"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 색상 선택기 */}
      <div className="mb-3">
        <input
          type="color"
          value={localColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-8 rounded cursor-pointer"
        />
      </div>

      {/* 스포이드 도구 */}
      {showEyeDropper && window.EyeDropper && (
        <button
          onClick={handleEyeDropper}
          disabled={isPickingColor}
          className={`flex items-center gap-2 w-full py-1.5 px-3 mb-3 rounded text-xs ${
            isPickingColor 
              ? 'bg-primary/20 text-primary/50' 
              : 'bg-bg hover:bg-bg-hover text-text-primary'
          }`}
        >
          <Pipette size={14} />
          {isPickingColor ? '색상 선택 중...' : '화면에서 색상 추출하기'}
        </button>
      )}

      {/* 미리 정의된 색상 */}
      <div className="mb-3">
        <div className="text-xs font-medium text-text-secondary mb-1">기본 색상</div>
        <div className="grid grid-cols-7 gap-1">
          {predefinedColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => handleColorChange(presetColor)}
              className={`w-7 h-7 rounded-md hover:scale-110 transition-transform ${
                presetColor === localColor ? 'ring-2 ring-primary' : ''
              }`}
              style={{ 
                backgroundColor: presetColor,
                border: presetColor === '#FFFFFF' ? '1px solid #DDD' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* 최근 사용한 색상 */}
      <div>
        <div className="text-xs font-medium text-text-secondary mb-1">최근 사용</div>
        <div className="grid grid-cols-5 gap-1">
          {recentColors.slice(0, 10).map((recentColor) => (
            <button
              key={recentColor}
              onClick={() => handleColorChange(recentColor)}
              className={`w-9 h-9 rounded-md hover:scale-110 transition-transform ${
                recentColor === localColor ? 'ring-2 ring-primary' : ''
              }`}
              style={{ 
                backgroundColor: recentColor,
                border: recentColor === '#FFFFFF' ? '1px solid #DDD' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;

// EyeDropper API 타입 정의
declare global {
  interface Window {
    EyeDropper?: {
      new(): {
        open: () => Promise<{ sRGBHex: string }>;
      };
    };
  }
} 