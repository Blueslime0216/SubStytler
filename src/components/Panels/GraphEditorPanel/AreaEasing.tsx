import React, { useEffect, useRef, useState, useMemo } from 'react';
import './AreaEasing.css';

type Position = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface AreaEasingProps {
  onCurveChange?: (p1x: number, p1y: number, p2x: number, p2y: number) => void;
}

/**
 * Interactive cubic-bezier editor. Simplified extraction from dev prototype.
 */
const AreaEasing: React.FC<AreaEasingProps> = ({ onCurveChange }) => {
  // Normalized control points (0..1)
  const [cp1, setCp1] = useState<{ x: number; y: number }>({ x: 0.1, y: 0.1 }); // (0.1,0.1)
  const [cp2, setCp2] = useState<{ x: number; y: number }>({ x: 0.9, y: 0.9 }); // (0.9,0.9)

  // Pixel positions derived from size
  const toPixel = (cp: {x:number;y:number}, w:number, h:number) => ({ x: cp.x*w, y: h - cp.y*h });

  const [size, setSize] = useState<{width: number, height: number}>({ width: 500, height: 500 });
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordCanvasRef = useRef<HTMLCanvasElement>(null);

  // ResizeObserver로 패널 크기 추적
  useEffect(() => {
    if (!areaRef.current) return;
    const update = () => {
      const rect = areaRef.current!.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new window.ResizeObserver(update);
    ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, []);

  // Draw grid whenever size 변동
  useEffect(() => {
    if (!coordCanvasRef.current) return;
    const ctx = coordCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const width = size.width;
    const height = size.height;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    const gridLines = 10;
    for (let i = 0; i <= gridLines; i++) {
      const x = (i / gridLines) * width;
      const y = (i / gridLines) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [size]);

  // Memoized pixel coords for handles
  const handleStart = useMemo(() => toPixel(cp1, size.width, size.height), [cp1, size]);
  const handleEnd = useMemo(() => toPixel(cp2, size.width, size.height), [cp2, size]);

  const handleDragging = (
    e: MouseEvent,
    setCP: React.Dispatch<React.SetStateAction<{x:number;y:number}>>
  ) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const px = clamp(e.clientX - rect.left, 0, size.width);
    const py = clamp(e.clientY - rect.top, 0, size.height);
    // convert to normalized
    const nx = px / size.width;
    const ny = 1 - py / size.height;
    setCP({ x: nx, y: ny });
  };

  const addDragListeners = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    setCP: React.Dispatch<React.SetStateAction<{x:number;y:number}>>
  ) => {
    e.preventDefault();
    const onMouseMove = (event: MouseEvent) => handleDragging(event, setCP);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Draw curve each time handles move or size changes
  useEffect(() => {
    if (onCurveChange) {
      onCurveChange(cp1.x, cp1.y, cp2.x, cp2.y);
    }
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const width = size.width;
    const height = size.height;
    ctx.clearRect(0, 0, width, height);
    // Guide lines
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(handleStart.x, handleStart.y);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(handleEnd.x, handleEnd.y);
    ctx.lineTo(width, 0);
    ctx.stroke();
    // Draw points along curve
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const y = bezierY(t);
      ctx.fillRect(t * width, height - y * height, 2, 2);
    }
  }, [cp1, cp2, onCurveChange, size, handleStart, handleEnd]);

  const bezierY = (x: number) => {
    const cp1x = cp1.x;
    const cp1y = cp1.y;
    const cp2x = cp2.x;
    const cp2y = cp2.y;
    // Duplicate of evaluation util but inline.
    const calculateBezier = (t: number, start: number, cp1: number, cp2: number, end: number) => {
      const oneMinusT = 1 - t;
      return (
        oneMinusT ** 3 * start +
        3 * oneMinusT ** 2 * t * cp1 +
        3 * oneMinusT * t ** 2 * cp2 +
        t ** 3 * end
      );
    };
    const calculateDerivative = (t: number, cp1: number, cp2: number) => {
      const oneMinusT = 1 - t;
      return 3 * oneMinusT ** 2 * cp1 + 6 * oneMinusT * t * cp2 + 3 * t ** 2;
    };
    let tt = x;
    for (let i = 0; i < 8; i++) {
      const currentX = calculateBezier(tt, 0, cp1x, cp2x, 1);
      const slope = calculateDerivative(tt, cp1x, cp2x);
      tt -= (currentX - x) / slope;
    }
    return calculateBezier(tt, 0, cp1y, cp2y, 1);
  };

  return (
    <div className="area-easing" ref={areaRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Handles */}
      <div
        className="handle start"
        style={{ left: handleStart.x, top: handleStart.y }}
        onMouseDown={(e) => addDragListeners(e, setCp1)}
      />
      <div
        className="handle end"
        style={{ left: handleEnd.x, top: handleEnd.y }}
        onMouseDown={(e) => addDragListeners(e, setCp2)}
      />

      {/* Points */}
      <div className="point start" />
      <div className="point end" />

      <canvas ref={coordCanvasRef} width={size.width} height={size.height} className="canvas coordinate" />
      <canvas ref={canvasRef} width={size.width} height={size.height} className="canvas curve" />
    </div>
  );
};

export default AreaEasing; 