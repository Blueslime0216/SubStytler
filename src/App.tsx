import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toolbar } from './components/UI/Toolbar';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { ToastContainer } from './components/UI/ToastContainer';
import { useLayoutStore } from './stores/layoutStore';
import { useProjectStore } from './stores/projectStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast } from './hooks/useToast';

function App() {
  const { areas, resizeArea } = useLayoutStore();
  const { createProject, currentProject } = useProjectStore();
  const { toasts, removeToast } = useToast();
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (!currentProject) {
      createProject('Untitled Project');
    }
  }, [currentProject, createProject]);

  return (
    <div className="h-screen text-white flex flex-col overflow-hidden bg-primary">
      <Toolbar />
      
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
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
        className="status-bar h-7 flex items-center px-8 space-x-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Ready</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>{currentProject?.subtitles.length || 0} subtitles</span>
          <span>•</span>
          <span>{currentProject?.name || 'Untitled Project'}</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <span>Sub-Stytler v2.0</span>
          <span>•</span>
          <span>Professional Edition</span>
        </div>
      </motion.div>

      {/* Enhanced Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;