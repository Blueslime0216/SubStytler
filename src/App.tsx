import React, { useState } from 'react';
import { AreaRenderer } from './components/Layout/AreaRenderer';

const INITIAL_AREAS = [
  // 1행
  { id: 'area-1-1', x: 0, y: 0, width: 33.33, height: 50, minWidth: 10, minHeight: 10 },
  { id: 'area-1-2', x: 33.33, y: 0, width: 33.34, height: 50, minWidth: 10, minHeight: 10 },
  { id: 'area-1-3', x: 66.67, y: 0, width: 33.33, height: 50, minWidth: 10, minHeight: 10 },
  // 2행
  { id: 'area-2-1', x: 0, y: 50, width: 33.33, height: 50, minWidth: 10, minHeight: 10 },
  { id: 'area-2-2', x: 33.33, y: 50, width: 33.34, height: 50, minWidth: 10, minHeight: 10 },
  { id: 'area-2-3', x: 66.67, y: 50, width: 33.33, height: 50, minWidth: 10, minHeight: 10 },
];

export default function App() {
  const [areas, setAreas] = useState(INITIAL_AREAS);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 20 }}>상단 헤더</h1>
      </header>
      <main style={{ flex: 1, background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, margin: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px #0001', background: '#fff', position: 'relative' }}>
          <AreaRenderer areas={areas} setAreas={setAreas} />
        </div>
      </main>
      <footer style={{ height: 48, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16 }}>하단 영역</span>
      </footer>
    </div>
  );
}