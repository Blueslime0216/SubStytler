import React from 'react';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { panelRegistry } from './config/panelRegistry';
import { Area } from './types/area';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // 🎯 동적 패널 렌더링 로직 - 모든 ID 패턴 지원
  const renderPanel = (area: Area) => {
    console.log('🎨 패널 렌더링 시도:', area.id);
    
    // 1️⃣ 직접 매칭 시도
    if (panelRegistry[area.id as keyof typeof panelRegistry]) {
      console.log('✅ 직접 매칭 성공:', area.id);
      const Component = panelRegistry[area.id as keyof typeof panelRegistry];
      return <Component />;
    }
    
    // 2️⃣ 패턴 매칭 시도 (예: "empty-1735113234567" → "empty")
    const baseType = area.id.split('-')[0];
    if (panelRegistry[baseType as keyof typeof panelRegistry]) {
      console.log('✅ 패턴 매칭 성공:', baseType);
      const Component = panelRegistry[baseType as keyof typeof panelRegistry];
      return <Component />;
    }
    
    // 3️⃣ 기본값: 빈 패널
    console.log('⚠️ 매칭 실패, 빈 패널 사용:', area.id);
    const EmptyComponent = panelRegistry.empty;
    return <EmptyComponent />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neu-base text-white" style={{ overflow: 'visible' }}>
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 shadow-neu-bottom relative z-20" style={{ background: 'var(--neu-base)' }}>
        <div className="flex items-center space-x-3">
          <div className="neu-btn-icon w-8 h-8 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20l9-5-9-5-9 5 9 5z"/><path d="M12 12l9-5-9-5-9 5 9 5z"/></svg>
          </div>
          <div>
            <div className="neu-title text-lg font-semibold">Sub-Stytler</div>
            <div className="neu-caption text-xs opacity-60">Professional Editor</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="neu-btn px-4 py-1.5 text-sm">Save Project</button>
          <button className="neu-btn px-4 py-1.5 text-sm">Export YTT</button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm opacity-80">Untitled Project</div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 h-full min-h-0 flex flex-col p-4"
        style={{
          overflow: 'visible',
          position: 'relative',
        }}
      >
        <div className="flex-1 h-full min-h-0 relative rounded-xl" style={{ overflow: 'visible' }}>
          <AreaRenderer
            areas={areas as any}
            setAreas={setAreas as any}
            renderPanel={renderPanel}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-6 flex items-center justify-between text-xs px-3 opacity-70" style={{ background: 'var(--neu-base-darker)' }}>
        <span>Ready • 0 subtitles • Untitled Project</span>
        <span>Sub-Stytler v2.0 • Professional Edition • Dark Mode</span>
      </footer>
    </div>
  );
}