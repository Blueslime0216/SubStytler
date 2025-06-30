import React from 'react';
import KeyframeButton from '../../../UI/KeyframeButton';

interface PositionTabProps {
  anchorPoint: number;
  positionX: number;
  positionY: number;
  setAnchorPoint: (value: number) => void;
  setPositionX: (value: number) => void;
  setPositionY: (value: number) => void;
}

const PositionTab: React.FC<PositionTabProps> = ({
  anchorPoint,
  positionX,
  positionY,
  setAnchorPoint,
  setPositionX,
  setPositionY
}) => {
  // 앵커 포인트 그리드 위치 매핑
  const anchorPositions = [
    { value: 0, label: '좌상단', x: 0, y: 0 },
    { value: 1, label: '상단 중앙', x: 1, y: 0 },
    { value: 2, label: '우상단', x: 2, y: 0 },
    { value: 3, label: '좌측 중앙', x: 0, y: 1 },
    { value: 4, label: '중앙', x: 1, y: 1 },
    { value: 5, label: '우측 중앙', x: 2, y: 1 },
    { value: 6, label: '좌하단', x: 0, y: 2 },
    { value: 7, label: '하단 중앙', x: 1, y: 2 },
    { value: 8, label: '우하단', x: 2, y: 2 },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* 앵커 포인트 선택 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
            앵커 포인트
          </h3>
          <KeyframeButton property="ap" getCurrentValue={() => anchorPoint} />
        </div>
        
        {/* 시각적 앵커 포인트 선택기 */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {anchorPositions.map((pos) => (
            <button
              key={pos.value}
              className={`
                aspect-square p-2 rounded-md flex items-center justify-center
                ${anchorPoint === pos.value 
                  ? 'bg-primary text-white' 
                  : 'bg-bg hover:bg-bg-hover text-text-secondary'}
              `}
              onClick={() => setAnchorPoint(pos.value)}
              title={pos.label}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
            </button>
          ))}
        </div>
        
        {/* 선택된 앵커 포인트 설명 */}
        <div className="text-center text-sm text-text-secondary">
          선택된 앵커: {anchorPositions.find(p => p.value === anchorPoint)?.label || '중앙'}
        </div>
      </div>
      
      {/* 위치 슬라이더 */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          자막 위치
        </h3>
        
        {/* 수평 위치 (X) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">
              수평 위치 (X): {positionX}%
            </label>
            <KeyframeButton property="ah" getCurrentValue={() => positionX} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={positionX}
              onChange={(e) => setPositionX(parseInt(e.target.value))}
              className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={positionX}
              onChange={(e) => setPositionX(parseInt(e.target.value) || 0)}
              className="w-16 bg-bg shadow-inset rounded p-1 text-xs text-text-primary text-center"
            />
          </div>
        </div>
        
        {/* 수직 위치 (Y) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">
              수직 위치 (Y): {positionY}%
            </label>
            <KeyframeButton property="av" getCurrentValue={() => positionY} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={positionY}
              onChange={(e) => setPositionY(parseInt(e.target.value))}
              className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={positionY}
              onChange={(e) => setPositionY(parseInt(e.target.value) || 0)}
              className="w-16 bg-bg shadow-inset rounded p-1 text-xs text-text-primary text-center"
            />
          </div>
        </div>
      </div>
      
      {/* 위치 프리셋 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          위치 프리셋
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: '상단', x: 50, y: 10, anchor: 1 },
            { name: '중앙', x: 50, y: 50, anchor: 4 },
            { name: '하단', x: 50, y: 90, anchor: 7 },
            { name: '좌측', x: 10, y: 50, anchor: 3 },
            { name: '우측', x: 90, y: 50, anchor: 5 },
            { name: '좌상단', x: 10, y: 10, anchor: 0 },
            { name: '우상단', x: 90, y: 10, anchor: 2 },
            { name: '좌하단', x: 10, y: 90, anchor: 6 },
            { name: '우하단', x: 90, y: 90, anchor: 8 },
          ].map((preset, index) => (
            <button
              key={index}
              className="p-2 bg-bg hover:bg-bg-hover rounded text-text-secondary text-sm transition-colors"
              onClick={() => {
                setPositionX(preset.x);
                setPositionY(preset.y);
                setAnchorPoint(preset.anchor);
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 위치 미리보기 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-primary border-b border-border-color pb-2">
          위치 미리보기
        </h3>
        
        <div className="relative bg-bg rounded-lg h-48 overflow-hidden">
          {/* 격자 배경 */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-border-color opacity-30" />
            ))}
          </div>
          
          {/* 위치 표시기 */}
          <div 
            className="absolute w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${positionX}%`,
              top: `${positionY}%`,
            }}
          />
          
          {/* 앵커 포인트 표시 */}
          <div
            className="absolute px-2 py-1 bg-surface border border-border-color rounded text-xs"
            style={{
              left: `${positionX}%`,
              top: `${positionY}%`,
              transform: `translate(${anchorPoint % 3 === 0 ? '0' : anchorPoint % 3 === 1 ? '-50%' : '-100%'}, ${Math.floor(anchorPoint / 3) === 0 ? '0' : Math.floor(anchorPoint / 3) === 1 ? '-50%' : '-100%'})`,
            }}
          >
            샘플 텍스트
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionTab; 