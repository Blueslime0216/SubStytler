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
      createProject('Mission Alpha-7');
    }
  }, [currentProject, createProject]);

  return (
    <div className="h-screen text-stellar flex flex-col overflow-hidden bg-space-void stellar-particles">
      <Toolbar />
      
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
      
      {/* 우주 정거장 상태바 */}
      <motion.div 
        className="station-status h-8 flex items-center px-10 space-x-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-aurora energy-pulse" />
          <span className="caption-station">Station Online</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="caption-station">{currentProject?.subtitles.length || 0} sequences</span>
          <span className="text-nebula">•</span>
          <span className="caption-station">{currentProject?.name || 'Mission Alpha-7'}</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-6">
          <span className="caption-station">Sub-Stytler Station v2.0</span>
          <span className="text-cosmic">•</span>
          <span className="caption-station text-cosmic">Deep Space Edition</span>
        </div>
      </motion.div>

      {/* 우주 정거장 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;