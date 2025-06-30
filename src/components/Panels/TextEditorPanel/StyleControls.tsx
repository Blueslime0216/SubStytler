import React from 'react';
import { SubtitleStyle } from '../../../types/project';

interface StyleControlsProps {
  style: SubtitleStyle;
  onUpdate: (property: keyof SubtitleStyle, value: any) => void;
}

/**
 * TextEditorPanel 내부에서 자막 스타일을 직접 조작하기 위한 UI 컴포넌트.
 * StyleManagerPanel 의 StyleEditor 코드에서 가장 많이 쓰는 항목만 추려서 옮겼다.
 *  - 텍스트/배경 색상 및 투명도 (0~255)
 *  - 폰트 크기 / 정렬 / 앵커 등 필요 시 쉽게 확장 가능
 */
const StyleControls: React.FC<StyleControlsProps> = ({ style, onUpdate }) => {
  /* ─────────────────────────────────────────────────────────────── */
  /* color + opacity helper                                         */
  /* ─────────────────────────────────────────────────────────────── */
  const handleColor = (key: 'fc' | 'bc', val: string) => onUpdate(key, val);
  const handleOpacity = (key: 'fo' | 'bo', val: number) => onUpdate(key, val);

  return (
    <div className="space-y-4 p-3 bg-surface rounded shadow-inset-subtle">
      <h4 className="text-xs font-semibold text-text-secondary">스타일 설정</h4>

      {/* Text Color & Opacity */}
      <div>
        <label className="block text-[10px] font-medium mb-1">텍스트 색상</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={style.fc || '#FFFFFF'}
            onChange={e => handleColor('fc', e.target.value)}
            className="w-7 h-7 border-none rounded"
          />
          <input
            type="text"
            value={style.fc || '#FFFFFF'}
            onChange={e => handleColor('fc', e.target.value)}
            className="flex-1 text-xs p-1 bg-bg rounded shadow-inset"
          />
        </div>
        <input
          type="range" min={0} max={255} step={1}
          value={style.fo ?? 255}
          onChange={e => handleOpacity('fo', parseInt(e.target.value))}
          className="w-full mt-1"
        />
        <div className="text-[10px] text-text-secondary mt-0.5">
          불투명도: {style.fo ?? 255} / 255
        </div>
      </div>

      {/* Background Color & Opacity */}
      <div>
        <label className="block text-[10px] font-medium mb-1">배경 색상</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={style.bc || '#000000'}
            onChange={e => handleColor('bc', e.target.value)}
            className="w-7 h-7 border-none rounded"
          />
          <input
            type="text"
            value={style.bc || '#000000'}
            onChange={e => handleColor('bc', e.target.value)}
            className="flex-1 text-xs p-1 bg-bg rounded shadow-inset"
          />
        </div>
        <input
          type="range" min={0} max={255} step={1}
          value={style.bo ?? 127}
          onChange={e => handleOpacity('bo', parseInt(e.target.value))}
          className="w-full mt-1"
        />
        <div className="text-[10px] text-text-secondary mt-0.5">
          배경 불투명도: {style.bo ?? 127} / 255
        </div>
      </div>
    </div>
  );
};

export default StyleControls; 