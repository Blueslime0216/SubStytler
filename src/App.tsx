import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toolbar } from './components/UI/Toolbar';
import { AreaRenderer } from './components/Layout/AreaRenderer';
import { ToastContainer } from './components/UI/ToastContainer';
import { useLayoutStore } from './stores/layoutStore';
import { useProjectStore } from './stores/projectStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast } from './hooks/useToast';
import { Cog } from 'lucide-react';

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
    <div className="h-screen text-primary flex flex-col overflow-hidden bg-workshop relative">
      {/* 배경 장식 기어들 */}
      <div className="fixed top-10 left-10 z-0">
        <Cog className="w-16 h-16 text-copper gear-slow opacity-10" />
      </div>
      <div className="fixed top-20 right-20 z-0">
        <Cog className="w-12 h-12 text-brass gear-reverse opacity-15" />
      </div>
      <div className="fixed bottom-16 left-1/4 z-0">
        <Cog className="w-8 h-8 text-bronze gear opacity-8" />
      </div>
      <div className="fixed bottom-32 right-1/3 z-0">
        <Cog className="w-6 h-6 text-steel gear-slow opacity-12" />
      </div>
      
      {/* 증기 효과 */}
      <div className="fixed top-1/4 left-1/2 z-0">
        <div className="steam-particle w-2 h-2 bg-steel-light rounded-full opacity-0"></div>
        <div className="steam-particle w-2 h-2 bg-steel-light rounded-full opacity-0"></div>
        <div className="steam-particle w-2 h-2 bg-steel-light rounded-full opacity-0"></div>
        <div className="steam-particle w-2 h-2 bg-steel-light rounded-full opacity-0"></div>
      </div>
      
      <Toolbar />
      
      <div className="flex-1 overflow-hidden relative z-10">
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
      
      {/* 스팀펑크 상태바 */}
      <motion.div 
        className="status-bar-steampunk h-6 flex items-center space-x-4 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 장식용 기어 */}
        <div className="absolute left-2 top-1">
          <Cog className="w-2 h-2 text-brass gear opacity-40" />
        </div>
        <div className="absolute right-4 top-1">
          <Cog className="w-2 h-2 text-copper gear-reverse opacity-30" />
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-brass pressure-gauge" />
          <span className="font-steampunk text-xs">Workshop Active</span>
        </div>
        
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span>{currentProject?.subtitles.length || 0} subtitles</span>
          <span>•</span>
          <span>{currentProject?.name || 'Untitled Project'}</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span>Sub-Stytler v2.0</span>
          <span>•</span>
          <span className="font-steampunk">Steampunk Edition</span>
        </div>
      </motion.div>

      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;