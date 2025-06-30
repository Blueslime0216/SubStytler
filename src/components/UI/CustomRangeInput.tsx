import React, { useState, useRef, useEffect } from 'react';

interface CustomRangeInputProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  className?: string;
  showInput?: boolean;
  showTooltip?: boolean;
  trackColor?: string;
  thumbColor?: string;
}

const CustomRangeInput: React.FC<CustomRangeInputProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '',
  className = '',
  showInput = true,
  showTooltip = true,
  trackColor = 'bg-primary',
  thumbColor = 'bg-primary'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const rangeRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 값이 변경될 때 입력 필드 업데이트
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // 슬라이더 위치 계산
  const calculatePercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  // 위치에서 값 계산
  const calculateValueFromPosition = (clientX: number) => {
    if (!rangeRef.current) return value;
    
    const rect = rangeRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const rawValue = min + (percentage / 100) * (max - min);
    
    // step에 맞게 값 조정
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  /* ------------------------------------------------------------------ */
  /* Pointer 이벤트로 전환 – 윈도 밖 드래그·업도 안정적으로 감지       */
  /* ------------------------------------------------------------------ */

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    // 캡처 시작
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newValue = calculateValueFromPosition(e.clientX);
    onChange(newValue);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newValue = calculateValueFromPosition(e.clientX);
    onChange(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // 입력 필드 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let newValue = parseFloat(inputValue);
    
    if (isNaN(newValue)) {
      newValue = value;
    } else {
      newValue = Math.max(min, Math.min(max, newValue));
    }
    
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // 툴팁 위치 업데이트
  useEffect(() => {
    if (showTooltip && thumbRef.current && tooltipRef.current && isDragging) {
      const thumbRect = thumbRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      tooltipRef.current.style.left = `${thumbRect.left + thumbRect.width / 2 - tooltipRect.width / 2}px`;
      tooltipRef.current.style.top = `${thumbRect.top - tooltipRect.height - 8}px`;
    }
  }, [value, isDragging, showTooltip]);

  return (
    <div className={`custom-range-input ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium text-text-secondary">{label}</label>
          <span className="text-xs text-text-secondary">
            {value}{unit}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2 select-none">
        {/* 슬라이더 영역 */}
        <div
          ref={rangeRef}
          className="relative h-5 flex-1 cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* 트랙 배경 */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-bg rounded-full shadow-inset" />
          
          {/* 진행 표시 */}
          <div
            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full ${trackColor}`}
            style={{ width: `${calculatePercentage(value)}%` }}
          />
          
          {/* 슬라이더 썸 */}
          <div
            ref={thumbRef}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md ${thumbColor} cursor-grab ${isDragging ? 'cursor-grabbing scale-110' : ''}`}
            style={{ left: `${calculatePercentage(value)}%` }}
          />
          
          {/* 툴팁 */}
          {showTooltip && isDragging && (
            <div
              ref={tooltipRef}
              className="fixed z-50 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
            >
              {value}{unit}
            </div>
          )}
        </div>
        
        {/* 직접 입력 필드 */}
        {showInput && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-14 text-xs bg-bg shadow-inset rounded p-1 text-text-primary text-center"
          />
        )}
      </div>
    </div>
  );
}

export default CustomRangeInput;