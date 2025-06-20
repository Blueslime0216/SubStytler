import React from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Settings, Sparkles } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

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
    <div className="neu-toolbar h-12 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Brand Section */}
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-8 h-8 rounded-xl neu-shadow-1 flex items-center justify-center neu-hover-lift"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: 'linear-gradient(145deg, var(--neu-base), var(--neu-accent))' }}
          >
            <Sparkles className="w-4 h-4 neu-text-accent" />
          </motion.div>
          <div>
            <h1 className="neu-heading-primary neu-text-accent">Sub-Stytler</h1>
            <p className="neu-caption">Professional Editor</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="neu-btn-primary flex items-center space-x-2 neu-hover-lift"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportYTT}
            className="neu-btn flex items-center space-x-2 neu-hover-lift"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>
      
      {/* Project Info & Settings */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="neu-body-primary text-xs">
            {currentProject?.name || 'Untitled Project'}
          </div>
          <div className="neu-caption">
            {currentProject?.subtitles.length || 0} subtitles
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="neu-btn-icon"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};