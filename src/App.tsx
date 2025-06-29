import React, { useMemo, useEffect } from 'react';
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
import { Moon, Sun, Save, File as FileExport, Undo, Redo, Menu } from 'lucide-react';
import logoDark from './assets/logo.svg';
import logoLight from './assets/logo_light.svg';
import { motion } from 'framer-motion';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // Theme state
  const { isDarkMode, toggleTheme } = useThemeStore();

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

  // History state for undo/redo
  const { pastStates, futureStates, undo, redo } = useHistoryStore(state => ({
    pastStates: state.pastStates,
    futureStates: state.futureStates,
    undo: state.undo,
    redo: state.redo
  }));

  // Set theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const logoSrc = isDarkMode ? logoDark : logoLight;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      {/* Header - Adobe-style App Bar */}
      <header className="h-16 flex items-center px-4 bg-surface border-b border-border-color shadow-sm">
        {/* Left Section - Logo and Main Menu */}
        <div className="flex items-center space-x-4">
          {/* App Logo */}
          <div className="flex items-center space-x-3 px-3">
            <motion.div
              whileHover={{ scale: [1, 0.92, 1.15], rotate: [0, 0, 6], boxShadow: ['0 0px 0px 0 rgba(94,129,172,0)', '0 0px 0px 0 rgba(94,129,172,0)', '0 4px 24px 0 rgba(94,129,172,0.25)'] }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, duration: 0.45 }}
              className="flex items-center justify-center w-11 h-11 bg-primary-color rounded-xl text-white overflow-hidden group"
            >
              <img src={logoSrc} alt="SubStytler Logo" className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-110" />
            </motion.div>
            <div>
              <div className="heading-primary text-lg font-semibold">Sub-Stytler</div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-border-color mx-2"></div>

          {/* Main Menu Items */}
          <div className="flex items-center space-x-2">
            <motion.button
              ref={fileMenuTriggerRef}
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className="btn-sm px-4 py-2 text-sm hover:bg-mid-color transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              Project
            </motion.button>
            
            <motion.button
              onClick={handleSaveProject}
              disabled={!canSave}
              className="btn-sm px-4 py-2 text-sm flex items-center space-x-2 hover:bg-mid-color disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Save size={16} />
              <span>Save</span>
            </motion.button>
            
            <motion.button
              className="btn-sm px-4 py-2 text-sm flex items-center space-x-2 hover:bg-mid-color transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <FileExport size={16} />
              <span>Export</span>
            </motion.button>
            
            <LayoutTemplateButton />
          </div>
        </div>

        {/* Center Section - Project Title */}
        <div className="flex-1 flex justify-center">
          <div className="text-base opacity-80 font-medium">Untitled Project</div>
        </div>

        {/* Right Section - Tools and Theme Toggle */}
        <div className="flex items-center space-x-3">
          {/* History Controls */}
          <div className="flex items-center space-x-1 mr-2">
            <button 
              onClick={undo}
              disabled={pastStates.length === 0}
              className="btn-icon w-7 h-7 flex items-center justify-center disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={14} />
            </button>
            <button 
              onClick={redo}
              disabled={futureStates.length === 0}
              className="btn-icon w-7 h-7 flex items-center justify-center disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={14} />
            </button>
          </div>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn-icon w-7 h-7 flex items-center justify-center"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          
          {/* More Options Menu */}
          <button className="btn-icon w-7 h-7 flex items-center justify-center ml-1">
            <Menu size={14} />
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
      <footer className="h-6 bg-surface text-xs text-text-secondary flex items-center justify-end px-4 border-t border-border-color">
        <span>Sub-Stytler Professional v1.0.0</span>
      </footer>

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