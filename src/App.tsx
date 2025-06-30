import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Moon, Sun, Save, File as FileExport, Undo, Redo, Menu, FileText, Upload, RefreshCw, LayoutTemplate } from 'lucide-react';
import logoDark from './assets/logo.svg';
import logoLight from './assets/logo_light.svg';
import { AutoSaveMenu } from './components/UI/AutoSaveMenu';
import { ExportMenu } from './components/UI/ExportMenu';
import { NewProjectDialog } from './components/UI/NewProjectDialog';
import { useProjectStore } from './stores/projectStore';

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
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAutoSaveMenuOpen, setIsAutoSaveMenuOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  
  const fileMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const exportMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const autoSaveMenuTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Video reupload dialog state - moved to App level for immediate access
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [pendingVideoInfo, setPendingVideoInfo] = useState<VideoInfo | null>(null);

  // Toast system
  const { toasts, removeToast } = useToast();

  // History state for undo/redo
  const { pastStates, futureStates, undo, redo } = useHistoryStore(state => ({
    pastStates: state.pastStates,
    futureStates: state.futureStates,
    undo: state.undo,
    redo: state.redo
  }));
  
  // Project state
  const { currentProject, updateProject, createProject } = useProjectStore();
  
  // Project title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

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
  
  // Create default project if none exists
  useEffect(() => {
    if (!currentProject) {
      createProject('Untitled Project');
    }
  }, [currentProject, createProject]);
  
  // Update title value when project changes
  useEffect(() => {
    if (currentProject) {
      setTitleValue(currentProject.name);
    }
  }, [currentProject]);

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
  
  // Handle title double click
  const handleTitleDoubleClick = () => {
    if (!currentProject) return;
    setIsEditingTitle(true);
  };

  // Handle title input blur
  const handleTitleBlur = () => {
    if (!currentProject) return;
    updateProject({ name: titleValue });
    setIsEditingTitle(false);
  };

  // Handle title input key down
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!currentProject) return;
      updateProject({ name: titleValue });
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitleValue(currentProject?.name || 'Untitled Project');
      setIsEditingTitle(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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
              transition={{ type: 'tween', stiffness: 300, damping: 18, duration: 0.45 }}
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
              onClick={() => {
                setIsFileMenuOpen(!isFileMenuOpen);
                setIsExportMenuOpen(false);
                setIsAutoSaveMenuOpen(false);
              }}
              className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span>Project</span>
            </motion.button>
            
            <motion.button
              ref={exportMenuTriggerRef}
              onClick={() => {
                setIsExportMenuOpen(!isExportMenuOpen);
                setIsFileMenuOpen(false);
                setIsAutoSaveMenuOpen(false);
              }}
              className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              disabled={!currentProject || !currentProject.subtitles.length}
            >
              <FileExport className="w-4 h-4 mr-2" />
              <span>Export</span>
            </motion.button>
            
            <LayoutTemplateButton />
            
            <motion.button
              ref={autoSaveMenuTriggerRef}
              onClick={() => {
                setIsAutoSaveMenuOpen(!isAutoSaveMenuOpen);
                setIsFileMenuOpen(false);
                setIsExportMenuOpen(false);
              }}
              className="btn-sm px-4 py-2 text-sm flex items-center hover:bg-mid-color disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.07, boxShadow: '0 2px 12px 0 rgba(94,129,172,0.10)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Auto Save</span>
            </motion.button>
          </div>
        </div>

        {/* Center Section - Project Title */}
        <div className="flex-1 flex justify-center">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-base bg-bg shadow-inset rounded px-2 py-1 text-text-primary w-64 text-center"
            />
          ) : (
            <div 
              className="text-base opacity-80 font-medium cursor-pointer hover:opacity-100 transition-opacity duration-200"
              onDoubleClick={handleTitleDoubleClick}
              title="Double-click to edit project name"
            >
              {currentProject?.name || "Untitled Project"}
            </div>
          )}
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
        onNewProject={() => setIsNewProjectDialogOpen(true)}
        hasVideo={!!currentProject?.videoMeta}
      />

      {/* Export Menu */}
      <ExportMenu
        isOpen={isExportMenuOpen}
        onClose={() => setIsExportMenuOpen(false)}
        triggerRef={exportMenuTriggerRef}
      />

      {/* Auto Save Menu */}
      <AutoSaveMenu
        isOpen={isAutoSaveMenuOpen}
        onClose={() => setIsAutoSaveMenuOpen(false)}
        triggerRef={autoSaveMenuTriggerRef}
      />

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
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