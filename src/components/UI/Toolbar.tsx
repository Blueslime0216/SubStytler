import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Sparkles } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { generateYTTContent } from '../../utils/yttGenerator';

export const Toolbar: React.FC = () => {
  const { saveProject, currentProject } = useProjectStore();

  const handleSave = () => {
    saveProject();
  };

  const handleExportYTT = () => {
    if (!currentProject) return;
    
    const yttContent = generateYTTContent(currentProject);
    const blob = new Blob([yttContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.ytt`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="neu-toolbar h-16 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 rounded-2xl neu-shadow-2 flex items-center justify-center neu-interactive"
            style={{ 
              background: 'linear-gradient(145deg, var(--neu-primary), var(--neu-primary-dark))',
              boxShadow: 'var(--neu-shadow-2), 0 0 12px rgba(99, 179, 237, 0.4)'
            }}
            title="Sub-Stytler Professional"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="neu-heading-primary neu-text-accent">Sub-Stytler</h1>
            <p className="neu-caption">Professional Editor</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleSave}
            className="neu-btn-primary flex items-center space-x-2 neu-interactive"
            title="Save Project (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span>Save Project</span>
          </motion.button>
          
          <motion.button
            onClick={handleExportYTT}
            className="neu-btn flex items-center space-x-2 neu-interactive"
            title="Export as YTT file"
          >
            <Download className="w-4 h-4" />
            <span>Export YTT</span>
          </motion.button>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <div className="neu-body-primary">
            {currentProject?.name || 'Untitled Project'}
          </div>
          <div className="neu-caption">
            {currentProject?.subtitles.length || 0} subtitles
          </div>
        </div>
        
        <motion.button
          className="neu-btn-icon neu-interactive"
          title="Application Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};