import React, { useState, useCallback } from 'react';
import AreaEasing from './AreaEasing';
import { useGraphLibraryStore } from '../../../stores/graphLibraryStore';

/**
 * Graph Editor Panel – wraps the AreaEasing editor extracted from dev folder.
 */
const GraphEditorPanel: React.FC = () => {
  const addCurve = useGraphLibraryStore((s) => s.addCurve);

  const [points, setPoints] = useState<[number, number, number, number]>([0, 0, 1, 1]);
  const [name, setName] = useState('');

  // Stable callback to avoid triggering infinite update loops in AreaEasing
  const handleCurveChange = useCallback((p1x: number, p1y: number, p2x: number, p2y: number) => {
    setPoints([p1x, p1y, p2x, p2y]);
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    addCurve({ name, p1x: points[0], p1y: points[1], p2x: points[2], p2y: points[3] });
    setName('');
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: 12 }}>
      <AreaEasing onCurveChange={handleCurveChange} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Curve name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button onClick={handleSave} style={{ padding: '4px 12px' }}>
          Save
        </button>
      </div>
    </div>
  );
};

export default GraphEditorPanel; 