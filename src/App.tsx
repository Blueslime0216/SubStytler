import React, { useMemo } from 'react';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { extractPanelType, getPanelComponent } from './config/panelRegistry';
import { Area } from './types/area';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // 🎯 완전히 새로운 패널 렌더링 로직 - 분할 기능 지원
  const renderPanel = useMemo(() => {
    return (area: Area) => {
      console.log('🎨 패널 렌더링:', area.id);
      
      try {
        // 🔧 패널 타입 추출
        const panelType = extractPanelType(area.id);
        console.log('🔍 추출된 패널 타입:', panelType);
        
        // 🔧 동적 컴포넌트 생성
        const PanelComponent = getPanelComponent(area.id);
        
        if (PanelComponent) {
          console.log('✅ 패널 렌더링 성공:', { areaId: area.id, panelType });
          return <PanelComponent key={area.id} />;
        }
        
        // 🔧 폴백: 직접 컴포넌트 생성
        const { Panel } = require('./components/Layout/Panel');
        console.log('🔄 폴백 패널 생성:', { areaId: area.id, panelType });
        return <Panel key={area.id} type={panelType} areaId={area.id} />;
        
      } catch (error) {
        console.error('❌ 패널 렌더링 오류:', error);
        
        // 🔧 에러 시 빈 패널 렌더링
        const { Panel } = require('./components/Layout/Panel');
        return <Panel key={area.id} type="empty" areaId={area.id} />;
      }
    };
  }, []);

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