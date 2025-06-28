import React, { useMemo } from 'react';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { panelRegistry } from './config/panelRegistry';
import { Area } from './types/area';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useThemeStore } from './stores/themeStore';
import { useHistoryStore } from './stores/historyStore';
import { useProjectSave } from './hooks/useProjectSave';
import { ProjectFileMenu } from './components/UI/ProjectFileMenu';
import { ToastContainer } from './components/UI/ToastContainer';
import { VideoReuploadDialog } from './components/UI/VideoReuploadDialog';
import { useToast } from './hooks/useToast';
import { VideoInfo } from './utils/videoUtils';
import { LayoutTemplateButton } from './components/UI/LayoutTemplateButton';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // Theme is always dark mode now - but keep for compatibility
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  // Project save functionality
  const { saveProjectToFileSystem, canSave, loadProjectFromFileSystem, loadProjectWithVideo } = useProjectSave();
  const [isFileMenuOpen, setIsFileMenuOpen] = React.useState(false);
  const fileMenuTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Video reupload dialog state - moved to App level for immediate access
  const [showVideoDialog, setShowVideoDialog] = React.useState(false);
  const [pendingProject, setPendingProject] = React.useState<any>(null);
  const [pendingVideoInfo, setPendingVideoInfo] = React.useState<VideoInfo | null>(null);

  // Toast system
  const { toasts, removeToast } = useToast();

  // Force dark theme on mount and always
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []); // Remove isDarkMode dependency since it's always true

  // 🔧 Initialize history store with current layout state
  React.useEffect(() => {
    const historyStore = useHistoryStore.getState();
    // Only record initial state if history is empty
    if (!historyStore.present && areas.length > 0) {
      setTimeout(() => {
        historyStore.record(areas, 'Initial layout state');
      }, 100); // Small delay to ensure all stores are initialized
    }
  }, [areas]);

  // 🆕 Auto-load project with video dialog when needed
  const handleProjectLoad = React.useCallback(async () => {
    const result = await loadProjectFromFileSystem();
    
    if (result.success && result.project) {
      if (result.videoInfo) {
        // Show video reupload dialog immediately
        setPendingProject(result.project);
        setPendingVideoInfo(result.videoInfo);
        setShowVideoDialog(true);
      } else {
        // Load project directly (no video info)
        loadProjectWithVideo(result.project);
      }
      setIsFileMenuOpen(false);
    }
  }, [loadProjectFromFileSystem, loadProjectWithVideo]);

  // 🆕 Handle video selection from dialog
  const handleVideoSelected = React.useCallback((videoFile: File) => {
    if (pendingProject) {
      loadProjectWithVideo(pendingProject, videoFile);
      setShowVideoDialog(false);
      setPendingProject(null);
      setPendingVideoInfo(null);
    }
  }, [pendingProject, loadProjectWithVideo]);

  // 🆕 Handle skipping video
  const handleSkipVideo = React.useCallback(() => {
    if (pendingProject) {
      loadProjectWithVideo(pendingProject);
      setShowVideoDialog(false);
      setPendingProject(null);
      setPendingVideoInfo(null);
    }
  }, [pendingProject, loadProjectWithVideo]);

  // 🆕 Handle closing video dialog
  const handleCloseVideoDialog = React.useCallback(() => {
    setShowVideoDialog(false);
    setPendingProject(null);
    setPendingVideoInfo(null);
  }, []);

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

  const handleSaveProject = async () => {
    await saveProjectToFileSystem();
  };

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
          <LayoutTemplateButton />
          <button 
            ref={fileMenuTriggerRef}
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
            className="btn px-4 py-1.5 text-sm shadow-outset bg-surface"
          >
            Project
          </button>
          <button 
            onClick={handleSaveProject}
            disabled={!canSave}
            className="btn px-4 py-1.5 text-sm shadow-outset bg-surface disabled:opacity-50"
          >
            Save Project
          </button>
          <button className="btn px-4 py-1.5 text-sm shadow-outset bg-surface">Export YTT</button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm opacity-80">Untitled Project</div>
          {/* Remove theme toggle button since we only have dark mode */}
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

      {/* Project File Menu */}
      <ProjectFileMenu
        isOpen={isFileMenuOpen}
        onClose={() => setIsFileMenuOpen(false)}
        triggerRef={fileMenuTriggerRef}
        onLoadProject={handleProjectLoad}
      />

      {/* Video Reupload Dialog - Now at App level for immediate access */}
      {showVideoDialog && pendingVideoInfo && (
        <VideoReuploadDialog
          isOpen={showVideoDialog}
          onClose={handleCloseVideoDialog}
          videoInfo={pendingVideoInfo}
          onVideoSelected={handleVideoSelected}
          onSkip={handleSkipVideo}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}