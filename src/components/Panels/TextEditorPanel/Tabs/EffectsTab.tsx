import React, { useState } from 'react';
import KeyframeButton from '../../../UI/KeyframeButton';
import ColorPicker from '../../../UI/ColorPicker';

interface EffectsTabProps {
  outlineColor: string;
  outlineType: number;
  setOutlineColor: (value: string) => void;
  setOutlineType: (value: number) => void;
}

const EffectsTab: React.FC<EffectsTabProps> = ({
  outlineColor,
  outlineType,
  setOutlineColor,
  setOutlineType
}) => {
  // 색상 피커 표시 상태
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState(false);
  
  // 외곽선 스타일 정의
  const outlineTypes = [
    { value: 0, name: 'None', description: 'No outline effect' },
    { value: 1, name: 'Hard Shadow', description: 'Apply a sharp shadow effect to the text' },
    { value: 2, name: 'Bevel', description: 'Apply a 3D bevel effect to the text' },
    { value: 3, name: 'Glow/Outline', description: 'Apply a glowing effect around the text' },
    { value: 4, name: 'Soft Shadow', description: 'Apply a soft shadow effect to the text' }
  ];
  
  // 외곽선 스타일에 따른 CSS 스타일 계산
  const getOutlineStyle = (type: number, color: string) => {
    switch (type) {
      case 1: // Hard shadow
        return { textShadow: `2px 2px 0 ${color}` };
      case 2: // Bevel
        return { textShadow: `1px 1px 0 ${color}, -1px -1px 0 ${color.replace('#', '#66')}` };
      case 3: // Glow/Outline
        return { textShadow: `0 0 3px ${color}, 0 0 3px ${color}, 0 0 3px ${color}, 0 0 3px ${color}` };
      case 4: // Soft shadow
        return { textShadow: `2px 2px 4px ${color}` };
      default:
        return {};
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* 외곽선 색상 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          Outline Color
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">Outline Color</label>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded cursor-pointer border border-border-color"
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
      </div>
      
      {/* 외곽선 스타일 섹션 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
            Outline Style
          </h3>
          <KeyframeButton property="et" getCurrentValue={() => outlineType} />
        </div>
        
        <div className="grid gap-2">
          {outlineTypes.map((type) => (
            <button
              key={type.value}
              className={`
                p-3 rounded-lg text-left flex items-center gap-3
                ${outlineType === type.value 
                  ? 'bg-primary bg-opacity-20 border border-primary' 
                  : 'bg-bg hover:bg-bg-hover border border-border-color'}
              `}
              onClick={() => setOutlineType(type.value)}
            >
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 bg-surface rounded-md flex items-center justify-center text-lg font-medium"
                  style={getOutlineStyle(type.value, outlineColor)}
                >
                  A
                </div>
              </div>
              <div>
                <div className="font-medium text-text-primary">{type.name}</div>
                <div className="text-xs text-text-secondary">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 미리보기 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          Effects Preview
        </h3>
        
        <div className="p-6 bg-bg rounded-lg flex items-center justify-center">
          <div
            className="px-4 py-2 text-2xl font-medium"
            style={{
              color: '#FFFFFF',
              ...getOutlineStyle(outlineType, outlineColor)
            }}
          >
            Sample Text
          </div>
        </div>
        
        {/* 효과 조합 프리셋 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 1, color: '#000000' },
            { type: 3, color: '#FFFFFF' },
            { type: 4, color: '#000000' },
            { type: 2, color: '#333333' },
            { type: 3, color: '#FF0000' },
            { type: 3, color: '#0000FF' },
          ].map((preset, index) => (
            <button
              key={index}
              className="p-2 bg-bg hover:bg-bg-hover rounded text-text-secondary text-sm transition-colors"
              onClick={() => {
                setOutlineType(preset.type);
                setOutlineColor(preset.color);
              }}
            >
              <div 
                className="h-10 flex items-center justify-center font-medium"
                style={getOutlineStyle(preset.type, preset.color)}
              >
                Aa
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 고급 효과 팁 */}
      <div className="bg-bg p-3 rounded-lg text-sm text-text-secondary">
        <h4 className="font-medium text-text-primary mb-1">Effect Tips</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Glow/Outline improves text visibility.</li>
          <li>Soft shadow softens the contrast between text and background.</li>
          <li>Bevel effect gives the text a 3D look.</li>
        </ul>
      </div>
    </div>
  );
};

export default EffectsTab; 