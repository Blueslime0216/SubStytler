import React from 'react';
import KeyframeButton from '../../../UI/KeyframeButton';

interface TextTabProps {
  selectedText: string;
  handleTextChange: (text: string) => void;
  fontFamily: string;
  setFontFamily: (value: string) => void;
  fontSize: string;
  setFontSize: (value: string) => void;
  printDirection: string;
  setPrintDirection: (value: string) => void;
}

const TextTab: React.FC<TextTabProps> = ({
  selectedText,
  handleTextChange,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  printDirection,
  setPrintDirection
}) => {
  // 폰트 크기 직접 입력 핸들러
  const handleFontSizeChange = (value: string) => {
    // 숫자만 추출하고 '%' 추가
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setFontSize(`${numericValue}%`);
    }
  };

  // 휠 이벤트로 폰트 크기 증감 (클릭 후 휠 조작)
  const handleFontSizeWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    // 기본 스크롤 방지
    e.preventDefault();
    e.stopPropagation();

    const current = parseInt(fontSize.replace(/[^0-9]/g, '')) || 100;
    // 휠 방향: 위로 돌리면 deltaY < 0 (증가), 아래로 돌리면 deltaY > 0 (감소)
    const step = e.shiftKey ? 50 : e.ctrlKey ? 1 : 10; // Shift: +50, Ctrl: +1, 기본 +10
    let next = current + (e.deltaY < 0 ? step : -step);
    if (next < 10) next = 10; // 최소값 10%
    setFontSize(`${next}%`);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 텍스트 입력 영역 - 더 크고 중요하게 표시 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-text-primary">
            Subtitle Text
          </label>
          <div className="text-xs text-text-secondary">
            {selectedText.length} chars
          </div>
        </div>
        <textarea
          value={selectedText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full h-32 bg-bg shadow-inset rounded-lg p-3 text-base text-text-primary resize-none focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="Enter subtitle text..."
        />
      </div>
      
      {/* 폰트 설정 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          Font Settings
        </h3>
        
        {/* 폰트 선택 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">Font</label>
            <KeyframeButton property="fs" getCurrentValue={() => fontFamily} />
          </div>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
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
        
        {/* 폰트 크기 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">Font Size</label>
            <KeyframeButton property="sz" getCurrentValue={() => fontSize} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              onWheel={handleFontSizeWheel}
              className="flex-1 bg-bg shadow-inset rounded p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g., 150%"
            />
            <div className="flex space-x-1">
              <button
                onClick={() => handleFontSizeChange((parseInt(fontSize) - 10) + '%')}
                className="px-2.5 py-1.5 bg-bg hover:bg-bg-hover rounded text-text-primary"
              >
                -
              </button>
              <button
                onClick={() => handleFontSizeChange((parseInt(fontSize) + 10) + '%')}
                className="px-2.5 py-1.5 bg-bg hover:bg-bg-hover rounded text-text-primary"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 텍스트 방향 섹션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          Text Direction
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">Text Direction</label>
            <KeyframeButton property="pd" getCurrentValue={() => printDirection} />
          </div>
          <select
            value={printDirection}
            onChange={(e) => setPrintDirection(e.target.value)}
            className="w-full bg-bg shadow-inset rounded p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="00">Horizontal LTR (Default)</option>
            <option value="20">Vertical RTL</option>
            <option value="21">Vertical LTR</option>
            <option value="30">Rotated 90°, LTR</option>
            <option value="31">Rotated 90°, RTL</option>
          </select>
        </div>
      </div>
      
      {/* 텍스트 샘플 미리보기 */}
      <div className="mt-6 p-3 bg-bg rounded-lg">
        <div className="text-xs text-text-secondary mb-1">Sample Preview</div>
        <div 
          className="p-2 overflow-hidden"
          style={{
            fontFamily: fontFamily === '0' ? 'Roboto, sans-serif' :
                      fontFamily === '1' ? 'Courier New, monospace' :
                      fontFamily === '2' ? 'Times New Roman, serif' :
                      fontFamily === '3' ? 'Lucida Console, monospace' :
                      fontFamily === '4' ? 'Roboto, sans-serif' :
                      fontFamily === '5' ? 'Comic Sans MS, cursive' :
                      fontFamily === '6' ? 'Monotype Corsiva, cursive' :
                      'Arial, sans-serif',
            fontSize: fontSize,
            writingMode: printDirection === '20' ? 'vertical-rl' :
                       printDirection === '21' ? 'vertical-lr' :
                       'horizontal-tb',
            transform: printDirection === '30' || printDirection === '31' ? 'rotate(-90deg)' : 'none',
            direction: printDirection === '31' ? 'rtl' : 'ltr',
          }}
        >
          {selectedText || 'Sample Text'}
        </div>
      </div>
    </div>
  );
};

export default TextTab; 