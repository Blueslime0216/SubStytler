import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Sparkles, Sun, Moon } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useThemeStore } from '../../stores/themeStore';

export const Toolbar: React.FC = () => {
  const { saveProject, currentProject } = useProjectStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

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

  const generateYTTContent = (project: any) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<timedtext format="3">
  <head>
    <wp id="0"/>
    <ws id="0" ju="2" pd="0"/>
`;

    project.styles.forEach((style: any, index: number) => {
      xml += `    <pen id="${index}" fc="${style.fc}" fo="${style.fo || 1}" bc="${style.bc}" bo="${style.bo || 0.8}" fs="${style.fs}" sz="${style.sz}"/>\n`;
    });

    xml += `  </head>
  <body>
`;

    project.subtitles.forEach((subtitle: any) => {
      const startTime = Math.floor(subtitle.startTime);
      const duration = Math.floor(subtitle.endTime - subtitle.startTime);
      
      xml += `    <p t="${startTime}" d="${duration}" wp="0" ws="0">
      <s p="0">${subtitle.spans[0]?.text || ''}</s>
    </p>
`;
    });

    xml += `  </body>
</timedtext>`;

    return xml;
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
          onClick={toggleTheme}
          className="neu-theme-toggle neu-interactive"
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
          <motion.div
            key={isDarkMode ? 'dark' : 'light'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.div>
        </motion.button>
        
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