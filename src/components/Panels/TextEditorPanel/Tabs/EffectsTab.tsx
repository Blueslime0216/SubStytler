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
    { value: 0, name: '없음', description: '외곽선 효과 없음' },
    { value: 1, name: '하드 그림자', description: '텍스트에 선명한 그림자 효과 적용' },
    { value: 2, name: '베벨', description: '텍스트에 입체감 있는 효과 적용' },
    { value: 3, name: '글로우/외곽선', description: '텍스트 주변에 빛나는 효과 적용' },
    { value: 4, name: '소프트 그림자', description: '텍스트에 부드러운 그림자 효과 적용' }
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
          외곽선 색상
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">외곽선 색상</label>
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
            외곽선 스타일
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
          효과 미리보기
        </h3>
        
        <div className="p-6 bg-bg rounded-lg flex items-center justify-center">
          <div
            className="px-4 py-2 text-2xl font-medium"
            style={{
              color: '#FFFFFF',
              ...getOutlineStyle(outlineType, outlineColor)
            }}
          >
            샘플 텍스트
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
        <h4 className="font-medium text-text-primary mb-1">효과 팁</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>글로우/외곽선은 텍스트를 더 잘 보이게 합니다.</li>
          <li>소프트 그림자는 배경과 텍스트 사이의 대비를 부드럽게 합니다.</li>
          <li>베벨 효과는 텍스트에 입체감을 줍니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default EffectsTab; 