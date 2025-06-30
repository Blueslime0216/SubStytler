import React, { useState } from 'react';
import { Palette, Type, Sliders, Layout, Pipette } from 'lucide-react';
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
  // 색상 피커 표시 상태
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState(false);

  // 폰트 크기 직접 입력 핸들러
  const handleFontSizeChange = (value: string) => {
    // 숫자만 추출하고 '%' 추가
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
          자막 텍스트
        </label>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full bg-bg shadow-inset rounded-lg p-3 text-sm text-text-primary resize-none"
          placeholder="자막 텍스트를 입력하세요..."
          rows={3}
        />
      </div>
      
      {/* 색상 및 스타일 섹션 */}
      <CollapsibleSection 
        title="색상 및 불투명도" 
        defaultOpen={true}
        icon={<Palette className="w-4 h-4 text-primary" />}
      >
        {/* 텍스트 색상 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">텍스트 색상</label>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded cursor-pointer border border-border-color"
                style={{ backgroundColor: textColor }}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              />
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
          
          <CustomRangeInput
            min={0}
            max={255}
            value={textOpacity}
            onChange={setTextOpacity}
            label="텍스트 불투명도"
            unit=""
          />
        </div>
        
        {/* 배경 색상 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">배경 색상</label>
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
          
          <CustomRangeInput
            min={0}
            max={255}
            value={backgroundOpacity}
            onChange={setBackgroundOpacity}
            label="배경 불투명도"
            unit=""
          />
        </div>
      </CollapsibleSection>
      
      {/* 글꼴 및 크기 섹션 */}
      <CollapsibleSection 
        title="글꼴 및 크기" 
        defaultOpen={true}
        icon={<Type className="w-4 h-4 text-primary" />}
      >
        {/* 글꼴 선택 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            글꼴
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="0">Roboto (기본)</option>
            <option value="1">Courier New</option>
            <option value="2">Times New Roman</option>
            <option value="3">Lucida Console</option>
            <option value="4">Roboto</option>
            <option value="5">Comic Sans MS</option>
            <option value="6">Monotype Corsiva</option>
            <option value="7">Arial</option>
          </select>
        </div>
        
        {/* 글꼴 크기 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            글꼴 크기
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-16 bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="flex-1 bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
            >
              <option value="75%">75% (작게)</option>
              <option value="100%">100% (기본)</option>
              <option value="125%">125% (조금 크게)</option>
              <option value="150%">150% (크게)</option>
              <option value="200%">200% (매우 크게)</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* 윤곽선 및 효과 섹션 */}
      <CollapsibleSection 
        title="윤곽선 및 효과" 
        icon={<Sliders className="w-4 h-4 text-primary" />}
      >
        {/* 윤곽선 색상 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">윤곽선 색상</label>
            <div className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded cursor-pointer border border-border-color"
                style={{ backgroundColor: outlineColor }}
                onClick={() => setShowOutlineColorPicker(!showOutlineColorPicker)}
              />
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
        
        {/* 윤곽선 스타일 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            윤곽선 스타일
          </label>
          <select
            value={outlineType}
            onChange={(e) => setOutlineType(parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>없음</option>
            <option value={1}>하드 그림자</option>
            <option value={2}>베벨</option>
            <option value={3}>글로우/외곽선</option>
            <option value={4}>부드러운 그림자</option>
          </select>
        </div>
      </CollapsibleSection>
      
      {/* 위치 및 방향 섹션 */}
      <CollapsibleSection 
        title="위치 및 방향" 
        icon={<Layout className="w-4 h-4 text-primary" />}
      >
        {/* 앵커 포인트 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            기준점
          </label>
          <select
            value={anchorPoint}
            onChange={(e) => setAnchorPoint(parseInt(e.target.value))}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value={0}>좌상단</option>
            <option value={1}>상단 중앙</option>
            <option value={2}>우상단</option>
            <option value={3}>좌측 중앙</option>
            <option value={4}>중앙 (기본)</option>
            <option value={5}>우측 중앙</option>
            <option value={6}>좌하단</option>
            <option value={7}>하단 중앙</option>
            <option value={8}>우하단</option>
          </select>
        </div>
        
        {/* 텍스트 방향 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            텍스트 방향
          </label>
          <select
            value={printDirection}
            onChange={(e) => setPrintDirection(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2 text-xs text-text-primary"
          >
            <option value="00">가로 왼쪽→오른쪽 (기본)</option>
            <option value="20">세로 오른쪽→왼쪽</option>
            <option value="21">세로 왼쪽→오른쪽</option>
            <option value="30">90° 회전, 왼쪽→오른쪽</option>
            <option value="31">90° 회전, 오른쪽→왼쪽</option>
          </select>
        </div>
        
        {/* 수평 위치 */}
        <div className="mb-4">
          <CustomRangeInput
            min={0}
            max={100}
            value={positionX}
            onChange={setPositionX}
            label="수평 위치 (X%)"
            unit="%"
          />
        </div>
        
        {/* 수직 위치 */}
        <div className="mb-4">
          <CustomRangeInput
            min={0}
            max={100}
            value={positionY}
            onChange={setPositionY}
            label="수직 위치 (Y%)"
            unit="%"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TextEditorContent;