import React from 'react';
import { useGraphLibraryStore } from '../../../stores/graphLibraryStore';
import { evaluateCurve } from '../../../utils/easingUtils';
import { ContextMenu } from '../../UI/ContextMenu/ContextMenu';
import { ContextMenuItem } from '../../UI/ContextMenu/ContextMenuItem';

const size = 80;

const CurvePreview: React.FC<{ id: string }> = ({ id }) => {
  const curve = useGraphLibraryStore((s) => s.curves[id]);
  if (!curve) return null;
  // Inline canvas rendering
  return (
    <div
      style={{
        width: size,
        height: size,
        margin: 4,
        position: 'relative',
        border: '1px solid var(--color-border, #555)',
        cursor: 'grab',
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('curve-id', id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      data-curve-id={id}
    >
      <Canvas curveId={id} />
    </div>
  );
};

const Canvas: React.FC<{ curveId: string }> = ({ curveId }) => {
  const curve = useGraphLibraryStore((s) => s.curves[curveId]);
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!ref.current || !curve) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;
    const w = size;
    const h = size;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#00caff';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const y = evaluateCurve(curve, x);
      ctx.lineTo(x * w, h - y * h);
    }
    ctx.stroke();
  }, [curve]);
  return <canvas width={size} height={size} ref={ref} />;
};

const GraphLibraryPanel: React.FC = () => {
  const ids = useGraphLibraryStore((s) => Object.keys(s.curves));
  return (
    <div className="h-full w-full flex flex-col bg-surface-color text-text-primary overflow-y-auto max-h-full" style={{overflowY: 'auto', maxHeight: '100%'}}>
      <div style={{ display: 'flex', flexWrap: 'wrap', padding: 8 }}>
        {ids.map((id) => (
          <CurvePreview key={id} id={id} />
        ))}
      </div>
    </div>
  );
};

export default GraphLibraryPanel; 