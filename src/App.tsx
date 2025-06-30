import React, { useEffect, useState } from 'react';
import { useLayoutStore } from './stores/layoutStore';
import { shallow } from 'zustand/shallow';
import { useHistoryStore } from './stores/historyStore';
import { useToast } from './hooks/useToast';
import { useThemeStore } from './stores/themeStore';
import { useProjectStore } from './stores/projectStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useYTTSync } from './hooks/useYTTSync';
import { motion, AnimatePresence } from 'framer-motion';
import boltLogo from './assets/bolt.png';

// Import component parts
import { AppHeader } from './components/App/AppHeader';
import { AppContent } from './components/App/AppContent';
import { AppFooter } from './components/App/AppFooter';
import { AppDialogs } from './components/App/AppDialogs';
import { AppToasts } from './components/App/AppToasts';
import { usePanelRenderer } from './components/App/usePanelRenderer';
import { useProjectHandlers } from './components/App/useProjectHandlers';
import { useProjectTitle } from './components/App/useProjectTitle';

function BoltFloatingLogo() {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      onClick={handleClick}
      animate={{
        x: [0, 4, -4, 0],
        boxShadow: [
          '0 2px 16px rgba(0,0,0,0.18), 0 0 0 0px #fff0',
          '0 2px 16px rgba(0,0,0,0.18), 0 0 12px 4px #fff4',
          '0 2px 16px rgba(0,0,0,0.18), 0 0 12px 4px #fff4',
          '0 2px 16px rgba(0,0,0,0.18), 0 0 0 0px #fff0',
        ],
      }}
      transition={{
        x: {
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'loop',
        },
        boxShadow: {
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatType: 'loop',
        },
      }}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 64,
        zIndex: 1000,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <img src={boltLogo} alt="bolt logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
    </motion.div>
  );
}

export default function App() {
  const { areas, setAreas } = useLayoutStore(
    state => ({ areas: state.areas, setAreas: state.setAreas }),
    shallow,
  );

  // Theme state
  const { isDarkMode } = useThemeStore();

  // Register global keyboard shortcuts
  useKeyboardShortcuts();
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

  // Project store
  const { currentProject, createProject } = useProjectStore();

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

  // 초기 프로젝트가 없으면 기본 프로젝트 생성
  useEffect(() => {
    if (!currentProject) {
      createProject('Untitled Project');
    }
  }, [currentProject, createProject]);

  // YTT ↔︎ Project 동기화
  useYTTSync();

  return (
    <>
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
      <BoltFloatingLogo />
    </>
  );
}