import React from 'react';

interface TextEditorPreviewProps {
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
}

const TextEditorPreview: React.FC<TextEditorPreviewProps> = ({
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
  printDirection,
  isBold,
  isItalic,
  isUnderline
}) => {
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
        return { textShadow: `1px 1px 0 ${outlineColor}, -1px -1px 0 ${outlineColor.replace('#', '#66')}` };
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

  // 스타일 계산
  const fontSizeValue = fontSize.replace('%', '');
  const fontSizeNumber = parseInt(fontSizeValue, 10) || 100;
  const fontSizePx = Math.round(16 * (fontSizeNumber / 100));
  
  const textColorRgba = hexToRgba(textColor, textOpacity);
  const bgColorRgba = hexToRgba(backgroundColor, backgroundOpacity);

  return (
    <div className="p-4">
      <div className="mb-2">
        <h3 className="text-xs font-medium text-text-secondary">미리보기</h3>
      </div>
      
      <div className="relative w-full h-24 bg-bg rounded-lg shadow-inset overflow-hidden flex items-center justify-center">
        <div
          className="px-4 py-2"
          style={{
            backgroundColor: bgColorRgba,
            color: textColorRgba,
            fontFamily: getFontFamily(),
            fontSize: `${fontSizePx}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            textAlign: getTextAlign(),
            ...getOutlineStyle(),
            ...getVerticalStyle(),
          }}
        >
          {selectedText || '미리보기 텍스트'}
        </div>
      </div>
    </div>
  );
};

export default TextEditorPreview;