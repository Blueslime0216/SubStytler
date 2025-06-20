import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toolbar } from './components/UI/Toolbar';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { ToastContainer } from './components/UI/ToastContainer';
import { useLayoutStore } from './stores/layoutStore';
import { useProjectStore } from './stores/projectStore';
import { useThemeStore } from './stores/themeStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast } from './hooks/useToast';

function App() {
  const { areas, resizeArea } = useLayoutStore();
  const { createProject, currentProject } = useProjectStore();
  const { isDarkMode } = useThemeStore();
  const { toasts, removeToast } = useToast();
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (!currentProject) {
      createProject('Untitled Project');
    }
  }, [currentProject, createProject]);

  // Apply theme to document - 다크 모드가 기본값
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="h-screen neu-text-primary flex flex-col neu-bg-base">
      <Toolbar />
      
      {/* Enhanced Panel Container - Increased padding for shadow visibility */}
      <div className="flex-1 p-4" style={{ overflow: 'visible' }}>
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ overflow: 'visible' }}
        >
          {areas.map(area => (
            <AreaRenderer
              key={area.id}
              area={area}
              onResize={resizeArea}
            />
          ))}
        </motion.div>
      </div>
      
      {/* Enhanced Status Bar */}
      <motion.div 
        className="neu-status-bar h-8 flex items-center space-x-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full neu-glow" style={{ background: 'var(--neu-success)' }} />
          <span className="font-semibold">Ready</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="font-medium">{currentProject?.subtitles.length || 0} subtitles</span>
          <span>•</span>
          <span className="font-medium">{currentProject?.name || 'Untitled Project'}</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <span className="font-medium">Sub-Stytler v2.0</span>
          <span>•</span>
          <span className="font-medium">Professional Edition</span>
          <span>•</span>
          <span className="neu-text-accent font-semibold">{isDarkMode ? 'Dark' : 'Light'} Mode</span>
        </div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;