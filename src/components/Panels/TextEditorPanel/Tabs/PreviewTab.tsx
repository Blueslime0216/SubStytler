import React, { useState } from 'react';

interface PreviewTabProps {
  selectedText: string;
  textColor: string;
  textOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: string;
  fontFamily: string;
  textAlignment: number;
  outlineColor: string;
  outlineType: number;
  anchorPoint: number;
  printDirection: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  positionX: number;
  positionY: number;
}

const PreviewTab: React.FC<PreviewTabProps> = ({
  selectedText,
  textColor,
  textOpacity,
  backgroundColor,
  backgroundOpacity,
  fontSize,
  fontFamily,
  textAlignment,
  outlineColor,
  outlineType,
  anchorPoint,
  printDirection,
  isBold,
  isItalic,
  isUnderline,
  positionX,
  positionY
}) => {
  // 미리보기 배경 상태
  const [previewBackground, setPreviewBackground] = useState<string>('gradient');
  const [videoBackground, setVideoBackground] = useState<boolean>(false);
  
  // 폰트 패밀리 계산
  const getFontFamily = () => {
    switch (fontFamily) {
      case '1': return 'Courier New, monospace';
      case '2': return 'Times New Roman, serif';
      case '3': return 'Lucida Console, monospace';
      case '4': return 'Roboto, sans-serif';
      case '5': return 'Comic Sans MS, cursive';
      case '6': return 'Monotype Corsiva, cursive';
      case '7': return 'Arial, sans-serif';
      default: return 'Roboto, sans-serif';
    }
  };

  // 텍스트 정렬 계산
  const getTextAlign = () => {
    switch (textAlignment) {
      case 1: return 'left';
      case 2: return 'right';
      case 3: return 'center';
      default: return 'center';
    }
  };

  // 외곽선 스타일 계산
  const getOutlineStyle = () => {
    if (!outlineType) return {};

    switch (outlineType) {
      case 1: // Hard shadow
        return { textShadow: `2px 2px 0 ${outlineColor}` };
      case 2: // Bevel
        return { textShadow: `-1px -1px 0 ${outlineColor}, 1px 1px 0 ${outlineColor}` };
      case 3: // Glow/Outline
        return { textShadow: `0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}, 0 0 3px ${outlineColor}` };
      case 4: // Soft shadow
        return { textShadow: `2px 2px 4px ${outlineColor}` };
      default:
        return {};
    }
  };

  // 세로쓰기 스타일 계산
  const getVerticalStyle = () => {
    switch (printDirection) {
      case '20': // Vertical RTL
        return { writingMode: 'vertical-rl' as const };
      case '21': // Vertical LTR
        return { writingMode: 'vertical-lr' as const };
      case '30': // Rotated 90° CCW, LTR
        return { transform: 'rotate(-90deg)', writingMode: 'horizontal-tb' as const };
      case '31': // Rotated 90° CCW, RTL
        return { transform: 'rotate(-90deg)', writingMode: 'horizontal-tb' as const, direction: 'rtl' as const };
      default: // Horizontal LTR
        return { writingMode: 'horizontal-tb' as const };
    }
  };

  // 색상 RGBA 변환
  const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 255})`;
  };

  // 배경 스타일 계산
  const getBackgroundStyle = () => {
    switch (previewBackground) {
      case 'dark':
        return { backgroundColor: '#121212' };
      case 'light':
        return { backgroundColor: '#f5f5f5' };
      case 'gradient':
        return { 
          backgroundImage: 'linear-gradient(to bottom right, #2D3748, #1A202C)',
          backgroundSize: 'cover'
        };
      case 'image':
        return { 
          backgroundImage: 'url("https://source.unsplash.com/random/1280x720/?nature")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#121212' };
    }
  };

  // 앵커 포인트 기반 변환 계산
  const getTransformStyle = () => {
    let xTransform = '0';
    let yTransform = '0';
    
    // 수평 변환 (X)
    if (anchorPoint % 3 === 1) { // 중앙 열
      xTransform = '-50%';
    } else if (anchorPoint % 3 === 2) { // 오른쪽 열
      xTransform = '-100%';
    }
    
    // 수직 변환 (Y)
    if (Math.floor(anchorPoint / 3) === 1) { // 중앙 행
      yTransform = '-50%';
    } else if (Math.floor(anchorPoint / 3) === 2) { // 하단 행
      yTransform = '-100%';
    }
    
    return `translate(${xTransform}, ${yTransform})`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 미리보기 배경 선택 */}
      <div className="p-4 border-b border-border-color">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-text-primary">Preview Background</h3>
          <div className="flex space-x-2">
            <button 
              className={`w-8 h-8 rounded-full bg-gray-900 ${previewBackground === 'dark' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setPreviewBackground('dark')}
              title="Dark Background"
            />
            <button 
              className={`w-8 h-8 rounded-full bg-gray-100 ${previewBackground === 'light' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setPreviewBackground('light')}
              title="Light Background"
            />
            <button 
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 ${previewBackground === 'gradient' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setPreviewBackground('gradient')}
              title="Gradient Background"
            />
            <button 
              className={`w-8 h-8 rounded-full bg-cover bg-center ${previewBackground === 'image' ? 'ring-2 ring-primary' : ''}`}
              style={{ backgroundImage: 'url("https://source.unsplash.com/random/100x100/?nature")' }}
              onClick={() => setPreviewBackground('image')}
              title="Image Background"
            />
          </div>
        </div>
      </div>
      
      {/* 미리보기 영역 */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          className="w-full h-full flex items-center justify-center p-4"
          style={getBackgroundStyle()}
        >
          {/* 자막 텍스트 */}
          <div
            className="px-4 py-2 max-w-full"
            style={{
              backgroundColor: hexToRgba(backgroundColor, backgroundOpacity),
              color: hexToRgba(textColor, textOpacity),
              fontFamily: getFontFamily(),
              fontSize: fontSize,
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textAlign: getTextAlign(),
              ...getOutlineStyle(),
              ...getVerticalStyle(),
              position: 'absolute',
              left: `${positionX}%`,
              top: `${positionY}%`,
              transform: getTransformStyle(),
            }}
          >
            {selectedText || 'Preview Text'}
          </div>
        </div>
      </div>
      
      {/* 스타일 요약 */}
      <div className="p-4 bg-surface border-t border-border-color">
        <h3 className="text-sm font-medium text-text-primary mb-2">Style Summary</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-secondary">Font:</span>
            <span className="font-medium">{
              fontFamily === '0' ? 'Roboto' :
              fontFamily === '1' ? 'Courier New' :
              fontFamily === '2' ? 'Times New Roman' :
              fontFamily === '3' ? 'Lucida Console' :
              fontFamily === '4' ? 'Roboto' :
              fontFamily === '5' ? 'Comic Sans MS' :
              fontFamily === '6' ? 'Monotype Corsiva' :
              'Arial'
            }</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Size:</span>
            <span className="font-medium">{fontSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Text Color:</span>
            <span className="font-medium flex items-center">
              {textColor}
              <span className="w-3 h-3 ml-1 rounded-full" style={{ backgroundColor: textColor }}></span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Background Color:</span>
            <span className="font-medium flex items-center">
              {backgroundColor}
              <span className="w-3 h-3 ml-1 rounded-full" style={{ backgroundColor: backgroundColor }}></span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Effect:</span>
            <span className="font-medium">{
              outlineType === 0 ? 'None' :
              outlineType === 1 ? 'Hard Shadow' :
              outlineType === 2 ? 'Bevel' :
              outlineType === 3 ? 'Glow/Outline' :
              'Soft Shadow'
            }</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Alignment:</span>
            <span className="font-medium">{
              textAlignment === 1 ? 'Left' :
              textAlignment === 2 ? 'Right' :
              'Center'
            }</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab; 