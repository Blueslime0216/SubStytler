import React, { useMemo } from 'react';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { panelRegistry } from './config/panelRegistry';
import { Area } from './types/area';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useThemeStore } from './stores/themeStore';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // 테마 상태 및 토글 함수
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  // 마운트 시 테마 동기화
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 🎯 동적 패널 렌더링 로직 - 모든 ID 패턴 지원
  const renderPanel = useMemo(() => {
    return (area: Area) => {
      // 1️⃣ 직접 매칭 시도
      if (panelRegistry[area.id as keyof typeof panelRegistry]) {
        const Component = panelRegistry[area.id as keyof typeof panelRegistry];
        return <Component areaId={area.id} />;
      }
      
      // 2️⃣ 패턴 매칭 시도 (예: "empty-1735113234567" → "empty")
      const baseType = area.id.split('-')[0];
      if (panelRegistry[baseType as keyof typeof panelRegistry]) {
        const Component = panelRegistry[baseType as keyof typeof panelRegistry];
        return <Component areaId={area.id} />;
      }
      
      // 3️⃣ 기본값: 빈 패널
      const EmptyComponent = panelRegistry.empty;
      return <EmptyComponent areaId={area.id} />;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 shadow-outset bg-surface">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 shadow-outset bg-surface">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20l9-5-9-5-9 5 9 5z"/><path d="M12 12l9-5-9-5-9 5 9 5z"/></svg>
          </div>
          <div>
            <div className="heading-primary text-lg">Sub-Stytler</div>
            <div className="caption text-xs">Professional Editor</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn px-4 py-1.5 text-sm shadow-outset bg-surface">Save Project</button>
          <button className="btn px-4 py-1.5 text-sm shadow-outset bg-surface">Export YTT</button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm opacity-80">Untitled Project</div>
          {/* 테마 토글 버튼 */}
          <button
            className="flex items-center justify-center w-8 h-8 ml-2 shadow-outset bg-surface"
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              // Sun icon
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
            ) : (
              // Moon icon
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 h-full min-h-0 flex flex-col p-4 relative">
        <div className="flex-1 h-full min-h-0 relative">
          <AreaRenderer
            areas={areas as any}
            setAreas={setAreas as any}
            renderPanel={renderPanel}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-6 bg-surface shadow-inset-subtle" />
    </div>
  );
}