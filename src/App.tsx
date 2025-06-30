import React, { useEffect } from 'react';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { useHistoryStore } from './stores/historyStore';
import { useToast } from './hooks/useToast';
import { useThemeStore } from './stores/themeStore';

// Import component parts
import { AppHeader } from './components/App/AppHeader';
import { AppContent } from './components/App/AppContent';
import { AppFooter } from './components/App/AppFooter';
import { AppDialogs } from './components/App/AppDialogs';
import { AppToasts } from './components/App/AppToasts';
import { usePanelRenderer } from './components/App/usePanelRenderer';
import { useProjectHandlers } from './components/App/useProjectHandlers';
import { useProjectTitle } from './components/App/useProjectTitle';

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // Theme state
  const { isDarkMode } = useThemeStore();

  // Register global keyboard shortcuts
  const { toasts, removeToast } = useToast();

  // Project handlers
  const {
    showVideoDialog,
    pendingVideoInfo,
    isNewProjectDialogOpen,
    setIsNewProjectDialogOpen,
    titleInputRef,
    handleProjectLoad,
    handleVideoSelected,
    handleSkipVideo,
    handleCloseVideoDialog
  } = useProjectHandlers();

  // Project title state
  const {
    isEditingTitle,
    setIsEditingTitle,
    titleValue,
    setTitleValue
  } = useProjectTitle();

  // Panel renderer
  const renderPanel = usePanelRenderer();

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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      {/* Header */}
      <AppHeader
        titleValue={titleValue}
        setTitleValue={setTitleValue}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        titleInputRef={titleInputRef}
        onLoadProject={handleProjectLoad}
        onNewProject={() => setIsNewProjectDialogOpen(true)}
      />

      {/* Main Content */}
      <AppContent
        areas={areas}
        setAreas={setAreas}
        renderPanel={renderPanel}
      />

      {/* Footer */}
      <AppFooter />

      {/* Dialogs */}
      <AppDialogs
        showVideoDialog={showVideoDialog}
        pendingVideoInfo={pendingVideoInfo}
        handleVideoSelected={handleVideoSelected}
        handleSkipVideo={handleSkipVideo}
        handleCloseVideoDialog={handleCloseVideoDialog}
        isNewProjectDialogOpen={isNewProjectDialogOpen}
        setIsNewProjectDialogOpen={setIsNewProjectDialogOpen}
      />

      {/* Toast Container */}
      <AppToasts toasts={toasts} onClose={removeToast} />
    </div>
  );
}